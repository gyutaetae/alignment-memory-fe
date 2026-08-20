import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { App } from "./App";
import { getFixtureMutationLog, resetFixtureApi } from "./shared/api/fixture";

const alignmentPath = "/alignments/40000000-0000-0000-0000-000000000001";
const exactQuote = "Browser extensions are out of scope for the MVP.";

function renderApp(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetFixtureApi();
  window.sessionStorage.clear();
});

afterEach(() => cleanup());

describe("React desktop product surface", () => {
  test("prioritizes direct conflicts before missing alignment on the dashboard", async () => {
    renderApp("/memory");

    expect(await screen.findByRole("heading", { name: "프로젝트 메모리" })).toBeVisible();
    const priorityList = screen.getByLabelText("Alignment 우선순위");
    const items = within(priorityList).getAllByRole("link");

    expect(items[0]).toHaveTextContent("PR #7");
    expect(items[0]).toHaveTextContent("Direct Conflict");
    expect(items[1]).toHaveTextContent("Missing Alignment");
    expect(priorityList).not.toHaveTextContent("Aligned");
  });

  test("reveals exact evidence and the source URL from Alignment Diff", async () => {
    renderApp(alignmentPath);

    expect(await screen.findByRole("heading", { name: "Alignment Diff" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "원본 소스 URL 열기" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "소스 근거 보기" }));

    const sourceLink = await screen.findByRole("link", { name: "원본 소스 URL 열기" });
    expect(sourceLink).toHaveAttribute("href", expect.stringContaining("github.com"));
    expect(sourceLink.closest("div")).toHaveTextContent(exactQuote);
  });

  test("updates the graph detail when a relevant node is selected", async () => {
    renderApp("/graph?focus=50000000-0000-0000-0000-000000000002");

    expect(await screen.findByRole("heading", { name: "Knowledge Graph" })).toBeVisible();
    const taskNode = await screen.findByText("Add extension synchronization");
    fireEvent.click(taskNode);

    expect(await screen.findByRole("heading", { name: "Add extension synchronization" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Alignment Diff 열기/i })).toBeVisible();
  });

  test("shows original evidence inside Context Passport only after its toggle", async () => {
    renderApp(alignmentPath);

    const passport = await screen.findByRole("complementary", { name: "Context Passport" });
    expect(within(passport).queryByText(exactQuote)).not.toBeInTheDocument();

    const originalToggle = await within(passport).findByRole("checkbox", {
      name: "Passport에 원본 근거 표시",
    });
    fireEvent.click(originalToggle);

    expect(await within(passport).findByText(exactQuote)).toBeVisible();
  });

  test("submits Handshake and Override through separate forms and requests", async () => {
    renderApp(alignmentPath);

    const handshakeButton = await screen.findByRole("button", { name: "Handshake 기록" });
    const overrideButton = screen.getByRole("button", { name: "Override 제출" });
    expect(handshakeButton.closest("form")).not.toBe(overrideButton.closest("form"));

    fireEvent.click(handshakeButton);
    await waitFor(() => expect(getFixtureMutationLog()).toEqual(["handshake"]));
    expect(await screen.findByText(/Handshake가 추가 전용 근거로 기록되었습니다/i)).toBeVisible();

    fireEvent.change(screen.getByLabelText(/Override 사유/i), {
      target: { value: "The proposed change is documentation-only and does not add extension sync." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Override 제출" }));

    await waitFor(() => expect(getFixtureMutationLog()).toEqual(["handshake", "override"]));
    expect(await screen.findByText(/Override가 기존 근거를 삭제하지 않고 기록되었습니다/i)).toBeVisible();
  });

  test("switches the reenacted Context Passport from Toronto English to Seoul Korean", async () => {
    renderApp(alignmentPath);

    const passport = await screen.findByRole("complementary", { name: "Context Passport" });
    expect(await within(passport).findByText("English · 자기 선언")).toBeVisible();

    fireEvent.click(within(passport).getByRole("button", { name: "서울 PM" }));

    expect(await within(passport).findByText("한국어 · 자기 선언")).toBeVisible();
    expect(within(passport).getByText(/현재 합의는 MVP를 저장소 중심으로 유지합니다/)).toBeVisible();
  });
});

import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "@xyflow/react/dist/style.css";
import { useProjectDashboard } from "../dashboard/api";
import { useRepositories } from "../repositories/api";
import { AsyncState } from "../shared/components/AsyncState";
import { StatusBadge } from "../shared/components/StatusBadge";
import { useKnowledgeGraph } from "./api";
import { layoutSubgraph, relevantSubgraph, type KnowledgeFlowNode } from "./layout";
import styles from "./KnowledgeGraphScreen.module.css";

function KnowledgeNodeCard({ data, selected }: NodeProps<KnowledgeFlowNode>) {
  return (
    <div className={`${styles.node} ${selected ? styles.selectedNode : ""}`} role="button" tabIndex={0}>
      <Handle className={styles.handle} position={Position.Left} type="target" />
      <span>{data.nodeType}</span>
      <strong>{data.label}</strong>
      <small><span aria-hidden="true">{data.status === "active" ? "✓" : "!"}</span> {data.status}</small>
      <Handle className={styles.handle} position={Position.Right} type="source" />
    </div>
  );
}

const nodeTypes: NodeTypes = { knowledge: KnowledgeNodeCard };

export function KnowledgeGraphScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const repositories = useRepositories();
  const repositoryId = repositories.data?.repositories[0]?.id;
  const graph = useKnowledgeGraph(repositoryId);
  const dashboard = useProjectDashboard(repositoryId);
  const requestedFocus = searchParams.get("focus");
  const defaultFocus = graph.data?.nodes.find((node) => node.nodeType === "decision")?.id;
  const focusNodeId = requestedFocus && graph.data?.nodes.some((node) => node.id === requestedFocus)
    ? requestedFocus
    : defaultFocus;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const activeNodeId = selectedNodeId ?? focusNodeId ?? null;

  const visibleGraph = useMemo(() => {
    if (!graph.data || !activeNodeId) return null;
    return relevantSubgraph(graph.data, activeNodeId, 2);
  }, [activeNodeId, graph.data]);
  const flow = useMemo(
    () => visibleGraph ? layoutSubgraph(visibleGraph.nodes, visibleGraph.edges) : { nodes: [], edges: [] },
    [visibleGraph],
  );
  const flowNodes = useMemo(
    () => flow.nodes.map((node) => ({ ...node, selected: node.id === activeNodeId })),
    [activeNodeId, flow.nodes],
  );

  if (repositories.isPending || graph.isPending) {
    return <AsyncState kind="loading" title="관련 지식 배치 중" message="선택된 노드와 1~2홉 근거 관계를 로딩하고 있습니다." />;
  }
  if (repositories.isError || graph.isError) {
    return (
      <AsyncState
        actionLabel="다시 시도"
        kind="error"
        message="Knowledge Graph를 불러올 수 없습니다."
        onAction={() => {
          void repositories.refetch();
          void graph.refetch();
        }}
        title="Knowledge Graph 로드 실패"
      />
    );
  }
  if (!visibleGraph || !activeNodeId || visibleGraph.nodes.length === 0) {
    return <AsyncState title="아직 Knowledge Node가 없습니다" message="Initial Sync를 완료하면 첫 번째 그래프가 생성됩니다." />;
  }

  const selectedNode = graph.data?.nodes.find((node) => node.id === activeNodeId);
  const relatedAlignment = dashboard.data?.recentAlignments.find((item) => item.outcome === "direct_conflict");

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>설명 화면 · 1~2홉</p>
          <h1>Knowledge Graph</h1>
          <span>revision {graph.data?.knowledgeRevision}에서 {visibleGraph.nodes.length}개의 관련 노드</span>
        </div>
        <Link to="/memory">← 충돌 목록으로</Link>
      </header>

      <div className={styles.graphLayout}>
        <section className={styles.canvas} aria-label="관련 프로젝트 지식 그래프">
          <div className={styles.canvasHeader}>
            <div><span aria-hidden="true">⌘</span><strong>관련 서브그래프</strong></div>
            <p>노드를 선택하면 2홉 맥락이 중심에 표시됩니다.</p>
          </div>
          <div className={styles.flowArea}>
            <ReactFlow
              edges={flow.edges}
              fitView
              maxZoom={1.4}
              minZoom={0.45}
              nodes={flowNodes}
              nodesConnectable={false}
              nodesDraggable={false}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id);
                setSearchParams({ focus: node.id });
              }}
              proOptions={{ hideAttribution: true }}
            >
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </section>

        <aside className={styles.detail} aria-live="polite">
          {selectedNode ? (
            <>
              <div className={styles.detailHeader}>
                <span>{selectedNode.nodeType}</span>
                <StatusBadge status={selectedNode.status === "disputed" ? "direct_conflict" : "aligned"} />
              </div>
              <h2>{selectedNode.title}</h2>
              <p>{selectedNode.summary}</p>
              <dl>
                <div><dt>Revision</dt><dd>{selectedNode.revision}</dd></div>
                <div><dt>Logical key</dt><dd>{selectedNode.logicalKey}</dd></div>
                <div><dt>근거</dt><dd>{selectedNode.evidence.length}개 소스</dd></div>
              </dl>
              {selectedNode.evidence[0] ? (
                <blockquote>{selectedNode.evidence[0].exactQuote}</blockquote>
              ) : null}
              {relatedAlignment ? (
                <Link to={`/alignments/${relatedAlignment.id}`}>Alignment Diff 열기 <span aria-hidden="true">→</span></Link>
              ) : null}
            </>
          ) : <p>○ 노드를 선택하면 근거를 확인할 수 있습니다.</p>}
        </aside>
      </div>
    </div>
  );
}

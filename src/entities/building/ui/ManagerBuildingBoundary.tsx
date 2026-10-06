import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isApiError } from '@/shared/api';
import { FullPageLoading, StateBoundary } from '@/shared/ui';
import { useManagerBuilding } from '../api/buildingApi';

/** Mount building-dependent lists only after the current building is confirmed. */
export function ManagerBuildingBoundary({ children }: { children: ReactNode }) {
  const building = useManagerBuilding();
  if (building.isPending) return <FullPageLoading />;
  if (building.isError) {
    if (
      isApiError(building.error) &&
      building.error.status === 404 &&
      building.error.code === 'BUILDING_NOT_FOUND'
    ) {
      return <BuildingRequired />;
    }
    return (
      <StateBoundary state="error" onRetry={() => void building.refetch()}>
        {null}
      </StateBoundary>
    );
  }
  return children;
}

export function BuildingRequired() {
  return (
    <div className="result-state">
      <h2>건물 정보가 필요해요</h2>
      <p>등록된 건물이 없어요. 건물을 먼저 등록해 주세요.</p>
      <Link className="text-link" to="/manager/building/new">
        건물 등록으로 이동
      </Link>
    </div>
  );
}

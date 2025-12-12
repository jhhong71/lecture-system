<script setup lang="ts">
import { ref, watch, toRefs, onUnmounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
// 스타일은 컴포넌트 내에서 로드하거나 전역에서 로드할 수 있습니다.
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Props 정의
const props = defineProps<{
  datasource: any[] | object; // 데이터 (배열이면 클라이언트 사이드, 객체면 서버 사이드 등 확장 가능)
  columns: any[];             // 컬럼 정의
  options?: object;           // 추가 그리드 옵션
  events?: { type: string; listener: Function }[]; // 이벤트 리스너 배열
}>();

const emit = defineEmits(['grid-ready', 'page-changed']);

const gridApi = ref<any>(null);
const gridColumnApi = ref<any>(null);

// 데이터소스가 배열인지 확인 (클라이언트 사이드 페이지네이션용)
const isClientSideData = ref(Array.isArray(props.datasource));
const internalRowData = ref<any[]>([]);

// datasource 변경 감지
watch(() => props.datasource, (newVal) => {
  if (Array.isArray(newVal)) {
    isClientSideData.value = true;
    internalRowData.value = newVal;
  } else {
    isClientSideData.value = false;
    // 만약 서버 사이드 datasource 객체라면 여기서 setDatasource 로직 추가 가능
  }
}, { immediate: true, deep: true });

// 기본 그리드 옵션
const defaultGridOptions = {
  pagination: true,
  paginationPageSize: 20,
  rowSelection: 'multiple', // 기본값
  suppressCellFocus: true,
  ...props.options // 부모에서 넘어온 옵션으로 덮어쓰기
};

// 그리드 준비 완료 시
const onGridReady = (params: any) => {
  gridApi.value = params.api;
  gridColumnApi.value = params.columnApi;

  // 1. 부모에서 전달받은 이벤트 리스너 등록
  if (props.events && props.events.length > 0) {
    props.events.forEach((eventItem) => {
      params.api.addEventListener(eventItem.type, eventItem.listener);
    });
  }

  // 2. 페이지 변경 이벤트 리스너 등록 (커스텀 emit용)
  params.api.addEventListener('paginationChanged', onPaginationChanged);

  // 3. 컬럼 사이즈 자동 조정
  params.api.sizeColumnsToFit();

  emit('grid-ready', params);
};

// 페이지 변경 핸들러
const onPaginationChanged = () => {
  if (gridApi.value) {
    const currentPage = gridApi.value.paginationGetCurrentPage();
    const totalPages = gridApi.value.paginationGetTotalPages();
    emit('page-changed', { currentPage, totalPages });
  }
};

// 컴포넌트 해제 시 이벤트 정리 (AG Grid는 자동 처리되지만 명시적 안전장치)
onUnmounted(() => {
  if (gridApi.value && props.events) {
    props.events.forEach((eventItem) => {
      gridApi.value.removeEventListener(eventItem.type, eventItem.listener);
    });
    gridApi.value.removeEventListener('paginationChanged', onPaginationChanged);
  }
});

// 외부에서 접근 가능한 메서드 노출
defineExpose({
  gridApi,
  gridColumnApi
});
</script>

<template>
  <div class="grid-wrapper ag-theme-quartz">
    <ag-grid-vue
      style="width: 100%; height: 100%;"
      :rowData="isClientSideData ? internalRowData : undefined"
      :columnDefs="columns"
      :gridOptions="defaultGridOptions"
      @grid-ready="onGridReady"
    >
    </ag-grid-vue>
  </div>
</template>

<style lang="scss" scoped>
.grid-wrapper {
  width: 100%;
  height: 600px; // 기본 높이 설정 (필요시 props로 처리 가능)
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  border: 1px solid #e0e0e0;

  // AG Grid 커스텀 스타일 (Vuetify 색상 변수 활용 가능)
  --ag-font-family: 'Noto Sans KR', sans-serif;
  --ag-header-background-color: #f8f9fa;
  --ag-header-foreground-color: #333;
  --ag-row-hover-color: #f5f9ff;
  --ag-selected-row-background-color: #e3f2fd;
}
</style>
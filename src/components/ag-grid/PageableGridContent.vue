<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const props = defineProps<{
  datasource: any[] | object;
  columns: any[];
  options?: object;
  events?: { type: string; listener: Function }[];
}>();

const emit = defineEmits(['grid-ready', 'page-changed']);

const gridApi = ref<any>(null);
const isClientSideData = ref(Array.isArray(props.datasource));
const internalRowData = ref<any[]>([]);

watch(() => props.datasource, (newVal) => {
  if (Array.isArray(newVal)) {
    isClientSideData.value = true;
    internalRowData.value = newVal;
  } else {
    isClientSideData.value = false;
  }
}, { immediate: true, deep: true });

// [중요] 모든 컬럼 기본 설정 (중앙 정렬 강제)
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  suppressMovable: true, // 컬럼 드래그 이동 방지
  cellClass: 'cell-center', 
  headerClass: 'header-center',
  minWidth: 100,
  flex: 1,
};

const defaultGridOptions = {
  pagination: true,
  paginationPageSize: 10,
  rowSelection: 'multiple',
  suppressCellFocus: true,
  animateRows: false,
  rowHeight: 50,    
  headerHeight: 50, 
  defaultColDef: defaultColDef,
  ...props.options
};

const onGridReady = (params: any) => {
  gridApi.value = params.api;
  
  if (props.events) {
    props.events.forEach((evt) => params.api.addEventListener(evt.type, evt.listener));
  }
  params.api.addEventListener('paginationChanged', onPaginationChanged);
  params.api.sizeColumnsToFit();
  emit('grid-ready', params);
};

const onPaginationChanged = () => {
  if (gridApi.value) {
    const currentPage = gridApi.value.paginationGetCurrentPage();
    const totalPages = gridApi.value.paginationGetTotalPages();
    emit('page-changed', { currentPage, totalPages });
  }
};

onUnmounted(() => {
  if (gridApi.value && props.events) {
    props.events.forEach((evt) => gridApi.value.removeEventListener(evt.type, evt.listener));
  }
});

defineExpose({ gridApi });
</script>

<template>
  <div class="grid-wrapper ag-theme-quartz" style="height: 600px; width: 100%;">
    <AgGridVue
      style="width: 100%; height: 100%;"
      :rowData="isClientSideData ? internalRowData : []"
      :columnDefs="columns"
      :gridOptions="defaultGridOptions"
      @grid-ready="onGridReady"
    />
  </div>
</template>


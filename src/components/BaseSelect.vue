<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  modelValue: string;
  items: string[];
}>();

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <div class="d-flex align-center">
    <span class="mr-3 text-subtitle-2 font-weight-bold text-grey-darken-3" style="min-width: 60px;">
      {{ label }}
    </span>
    <v-select
      v-model="internalValue"
      :items="items"
      variant="outlined"
      density="compact"
      hide-details
      bg-color="white"
      color="primary"
      class="flex-grow-1"
    ></v-select>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['click']);
</script>

<template>
  <v-btn
    color="primary"
    height="40"
    width="100"
    elevation="2"
    prepend-icon="mdi-magnify"
    @click="emit('click')"
  >
    검색
  </v-btn>
</template>
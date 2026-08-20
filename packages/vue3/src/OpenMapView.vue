<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { OpenMap, type OpenMapOptions } from '@indeedworks/open-map';

const props = defineProps<{ options: Omit<OpenMapOptions, 'container'> }>();
const emit = defineEmits<{ ready: [map: OpenMap]; error: [error: unknown] }>();
const container = ref<HTMLElement>();
const instance = shallowRef<OpenMap>();
let observer: ResizeObserver | undefined;

onMounted(() => {
  if (!container.value) return;
  instance.value = new OpenMap({ ...props.options, container: container.value });
  instance.value.ready().then((map) => emit('ready', map)).catch((error) => emit('error', error));
  observer = new ResizeObserver(() => instance.value?.resize());
  observer.observe(container.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  instance.value?.destroy();
  instance.value = undefined;
});

defineExpose({ map: instance, getMap: () => instance.value });
</script>

<template><div ref="container" class="open-map-vue3" /></template>

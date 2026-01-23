<template>
  <Markdown :title="title">
    <VueComponent />
  </Markdown>
</template>

<script setup>
import { ref } from 'vue'
import Markdown from '@/components/Markdown.vue'
import { attributes, VueComponent } from '../../../README.md'

const title = ref(attributes.title)
</script>

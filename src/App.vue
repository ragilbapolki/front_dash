<template>
  <!--
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  -->
  <RouterView />
  <ChatWidget />
</template>

<script setup>
// import { RouterLink } from 'vue-router'
import ChatWidget from "@/components/ChatWidget.vue";
</script>

<style scoped>
</style>

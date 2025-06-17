<script lang="ts" setup>
// If you want to use it in setup, import from the nuxtApp.
const { $pwa }: any = useNuxtApp()
</script>

<template>
  <!-- You can use $pwa directly in templates! -->
  <div v-show="$pwa.needRefresh" class="py-8 print:hidden">
    <span>
      New content available, click on reload button to update.
    </span>

    <button class="font-semibold text-indigo-500 hover:text-indigo-400" @click="$pwa.updateServiceWorker()">
      Reload
    </button>
  </div>
</template>

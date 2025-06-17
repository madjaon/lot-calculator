<script lang="ts" setup>
// Create reactive date object
const time = ref(new Date())

// Set interval every second
setInterval(() => {
  time.value = new Date()
}, 1000)

// Computed functions to get units
const getSeconds = computed(() =>
  time.value.getSeconds().toString().padStart(2, '0'),
)
const getMinutes = computed(() =>
  time.value.getMinutes().toString().padStart(2, '0'),
)
const getHours = computed(() =>
  time.value.getHours().toString().padStart(2, '0'),
)
</script>

<template>
  <section class="clock">
    <DigitalClockDigit :value="getHours" />
    <span class="clock__unit">:</span>
    <DigitalClockDigit :value="getMinutes" />
    <span class="clock__unit">:</span>
    <DigitalClockDigit :value="getSeconds" />
  </section>
</template>

<style>
.clock {
  font-family: 'Share Tech Mono', monospace;
  @apply
    flex items-center justify-center p-4 mt-12;
}
.clock__unit {
  @apply
    inline text-gray-600 font-black text-2xl md:text-4xl px-2;
}
</style>

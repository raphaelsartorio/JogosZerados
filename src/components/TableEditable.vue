<script setup>
defineProps({
  title: String,
  description: String,
  addLabel: {
    type: String,
    default: '',
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add'])
</script>

<template>
  <section class="glass-panel overflow-hidden rounded-[1.75rem]">
    <div class="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="section-title">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-sm text-[var(--color-muted)]">{{ description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <slot name="toolbar" />
        <button
          v-if="canAdd"
          type="button"
          class="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          @click="$emit('add')"
        >
          {{ addLabel || 'Adicionar item' }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="sticky top-0 z-10 bg-[var(--color-panel-strong)]">
          <slot name="head" />
        </thead>
        <tbody>
          <slot />
        </tbody>
      </table>
    </div>
  </section>
</template>

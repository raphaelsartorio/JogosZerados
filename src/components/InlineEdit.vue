<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, null],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
  step: {
    type: [String, Number],
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'commit'])
const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = value
  },
)

const normalizedOptions = computed(() =>
  props.options.map((option) => {
    if (typeof option === 'object') {
      return option
    }

    return { label: option, value: option }
  }),
)

function updateValue(value) {
  localValue.value = value
  emit('update:modelValue', value)
}

function onInput(event) {
  const element = event.target
  const value = props.type === 'checkbox' ? element.checked : element.value
  updateValue(value)
}

function commit() {
  emit('commit', localValue.value)
}
</script>

<template>
  <select
    v-if="type === 'select'"
    :value="localValue"
    class="app-select"
    @change="onInput($event); commit()"
  >
    <option value="">{{ placeholder || 'Selecione' }}</option>
    <option v-for="option in normalizedOptions" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>

  <label
    v-else-if="type === 'checkbox'"
    class="inline-flex items-center justify-center"
  >
    <input
      :checked="Boolean(localValue)"
      class="app-checkbox"
      type="checkbox"
      @change="onInput($event); commit()"
    />
  </label>

  <input
    v-else
    :value="localValue"
    :type="type"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    class="app-input"
    @input="onInput"
    @blur="commit"
    @keydown.enter.prevent="commit"
  />
</template>

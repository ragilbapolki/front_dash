<template>
  <div class="wrap" v-if="info.status" :style="{ 'background-color': backgroundColor }">
    <!-- Default icon sebelum load selesai -->
    <svg-icon
      v-if="!info.finishLoadFlag"
      :icon="defaultName"
      class="icon"
      :style="{ color: defaultColor, objectFit: 'cover', width: defaultWidth, height: defaultHeight }"
    />

    <!-- Gambar utama -->
    <img
      :src="src ? src + info.XOssProcess : 'loadError'"
      @load="onLoadSuccess"
      @error="onLoadError"
      :class="{ 'before-load': !info.finishLoadFlag }"
      :style="{
        objectFit: mode,
        width: info.finishLoadFlag && width ? width : defaultWidth,
        height: info.finishLoadFlag && height ? height : defaultHeight
      }"
    />
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  defaultName: { type: String, default: 'default' },
  defaultColor: { type: String, default: '' },
  defaultWidth: { type: String, default: '72%' },
  defaultHeight: { type: String, default: '72%' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  mode: { type: String, default: 'cover' },
  backgroundColor: { type: String, default: 'transparent' },
  ossFormat: { type: String, default: '' },
  ossW: { type: Number, default: 750 }
})

const info = reactive({
  finishLoadFlag: false,
  XOssProcess: '',
  status: 0
})

// Fungsi untuk generate string OSS
const setOssStr = () => {
  const src = props.src

  // pastikan src valid
  if (!src || typeof src !== 'string') {
    info.status = 0
    info.XOssProcess = ''
    return
  }

  // jika src bukan http atau sudah ada query string
  if (!src.includes('http') || src.lastIndexOf('?') !== -1) {
    info.status = 1
    info.XOssProcess = ''
    return
  }

  const srcInfo = src.split('.')
  const format = props.ossFormat || srcInfo[srcInfo.length - 1].toLowerCase()

  info.XOssProcess = `?x-oss-process=image/resize,m_lfit,w_${props.ossW}/format,${format}/quality,Q_90`
  info.status = 1
}

// Event load sukses
const onLoadSuccess = () => {
  info.finishLoadFlag = true
}

// Event load error
const onLoadError = () => {
  info.finishLoadFlag = false
}

// Watch jika props.src berubah
watch(() => props.src, () => {
  info.finishLoadFlag = false
  info.status = 0
  setOssStr()
})

// Panggil pertama kali
setOssStr()
</script>

<style scoped lang="scss">
.before-load {
  width: 0 !important;
  height: 0 !important;
  opacity: 0;
}

.wrap {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

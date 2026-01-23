<!-- ImageGallery.vue - Complete Gallery Component with Lightbox -->
<template>
  <div class="image-gallery">
    <!-- Gallery Wrapper -->
    <div :class="['gallery-wrapper', `gallery-${layout}`]">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <img
          :src="image.url"
          :alt="image.caption || `Image ${index + 1}`"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-if="image.caption" class="gallery-caption">
          {{ image.caption }}
        </div>
        <div class="gallery-overlay">
          <svg class="zoom-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Transition name="fade">
      <div v-if="showLightbox" class="gallery-lightbox" @click="closeLightbox">
        <!-- Close Button -->
        <button class="lightbox-close" @click.stop="closeLightbox" aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          class="lightbox-nav prev"
          @click.stop="prevImage"
          aria-label="Previous image"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Image Content -->
        <div class="lightbox-content" @click.stop>
          <img
            :src="images[currentIndex].url"
            :alt="images[currentIndex].caption"
            @load="handleImageLoad"
          />
          <div v-if="images[currentIndex].caption" class="lightbox-caption">
            {{ images[currentIndex].caption }}
          </div>
        </div>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          class="lightbox-nav next"
          @click.stop="nextImage"
          aria-label="Next image"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Image Counter -->
        <div v-if="images.length > 1" class="lightbox-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Thumbnail Strip (Optional) -->
        <div v-if="images.length > 1 && showThumbnails" class="lightbox-thumbnails">
          <div
            v-for="(image, index) in images"
            :key="index"
            :class="['thumbnail-item', { active: index === currentIndex }]"
            @click.stop="currentIndex = index"
          >
            <img :src="image.url" :alt="`Thumbnail ${index + 1}`" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(img => img.url)
    }
  },
  layout: {
    type: String,
    default: 'grid',
    validator: (value) => {
      return ['grid', 'masonry', 'scroll'].includes(value)
    }
  },
  showThumbnails: {
    type: Boolean,
    default: false
  }
})

const showLightbox = ref(false)
const currentIndex = ref(0)

const openLightbox = (index) => {
  currentIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const handleKeydown = (e) => {
  if (!showLightbox.value) return

  switch(e.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'ArrowLeft':
      prevImage()
      break
  }
}

const handleImageError = (e) => {
  e.target.src = '/placeholder-image.png' // Fallback image
  console.error('Image failed to load:', e.target.src)
}

const handleImageLoad = (e) => {
  console.log('Image loaded successfully:', e.target.src)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-gallery {
  margin: 2rem 0;
}

/* ===================================
   GRID LAYOUT
   =================================== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

/* ===================================
   MASONRY LAYOUT
   =================================== */
.gallery-masonry {
  column-count: 3;
  column-gap: 1.5rem;
  padding: 1rem;
}

.gallery-masonry .gallery-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  display: inline-block;
  width: 100%;
}

.gallery-masonry .gallery-item img {
  height: auto;
}

/* ===================================
   SCROLL LAYOUT
   =================================== */
.gallery-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
}

.gallery-scroll::-webkit-scrollbar {
  height: 8px;
}

.gallery-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.gallery-scroll::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
  transition: background 0.2s;
}

.gallery-scroll::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.gallery-scroll .gallery-item {
  flex: 0 0 320px;
  scroll-snap-align: start;
}

/* ===================================
   GALLERY ITEM
   =================================== */
.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  cursor: pointer;
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.gallery-item img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* Gallery Overlay */
.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.zoom-icon {
  width: 3rem;
  height: 3rem;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Gallery Caption */
.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-caption {
  transform: translateY(0);
}

/* ===================================
   LIGHTBOX
   =================================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.gallery-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Lightbox Content */
.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}

.lightbox-caption {
  text-align: center;
  color: white;
  margin-top: 1rem;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.375rem;
  backdrop-filter: blur(8px);
}

/* Lightbox Close Button */
.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  background: white;
  border: none;
  border-radius: 50%;
  color: #111827;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.lightbox-close svg {
  width: 1.5rem;
  height: 1.5rem;
}

.lightbox-close:hover {
  background: #f3f4f6;
  transform: rotate(90deg) scale(1.1);
}

/* Lightbox Navigation */
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.lightbox-nav:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav.prev {
  left: 2rem;
}

.lightbox-nav.next {
  right: 2rem;
}

.lightbox-nav svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #111827;
}

/* Lightbox Counter */
.lightbox-counter {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Lightbox Thumbnails */
.lightbox-thumbnails {
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0.5rem;
  backdrop-filter: blur(8px);
  max-width: 90vw;
  overflow-x: auto;
}

.lightbox-thumbnails::-webkit-scrollbar {
  height: 4px;
}

.lightbox-thumbnails::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.lightbox-thumbnails::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  opacity: 0.6;
}

.thumbnail-item:hover {
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: white;
  opacity: 1;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===================================
   RESPONSIVE
   =================================== */
@media (max-width: 1024px) {
  .gallery-masonry {
    column-count: 2;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .gallery-masonry {
    column-count: 1;
  }

  .gallery-scroll .gallery-item {
    flex: 0 0 250px;
  }

  .lightbox-nav {
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox-nav.prev {
    left: 1rem;
  }

  .lightbox-nav.next {
    right: 1rem;
  }

  .lightbox-counter {
    bottom: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .lightbox-thumbnails {
    display: none;
  }

  .lightbox-close {
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox-close svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-scroll .gallery-item {
    flex: 0 0 200px;
  }

  .gallery-item img {
    height: 220px;
  }
}
</style>

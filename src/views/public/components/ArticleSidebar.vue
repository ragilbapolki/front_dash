<!-- ArticleSidebar.vue -->
<!-- Lokasi: src/components/ArticleSidebar.vue -->
<template>
  <aside class="sidebar">
    <!-- Related Articles -->
    <div class="sidebar-card">
      <h3 class="sidebar-title">📚 Artikel Terkait ({{ relatedArticles.length }})</h3>

      <!-- Show message if no related articles -->
      <div v-if="relatedArticles.length === 0" class="no-related">
        <p>Tidak ada artikel terkait</p>
      </div>

      <!-- Related articles list -->
      <div v-else class="related-articles">
        <router-link
          v-for="related in paginatedRelatedArticles"
          :key="related.id + '-' + related.slug"
          :to="{ name: 'ArticleDetail', params: { slug: related.slug } }"
          class="related-item"
        >
          <el-tag :type="getTagType(related.type)" size="small" effect="plain">
            {{ related.type }}
          </el-tag>
          <span class="related-title">{{ related.title }}</span>
        </router-link>
      </div>

      <!-- Pagination untuk Related Articles -->
      <div v-if="relatedArticles.length > pageSize" class="related-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          small
          background
          layout="prev, pager, next"
          :total="relatedArticles.length"
          :page-size="pageSize"
          @current-change="handlePageChange"
          :hide-on-single-page="false"
        />
      </div>
    </div>

    <!-- Document Info -->
    <div v-if="article" class="sidebar-card">
      <h3 class="sidebar-title">ℹ️ Informasi Dokumen</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Dibuat pada</span>
          <span class="info-value">{{ formatDate(article.created_at) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Diperbarui pada</span>
          <span class="info-value">{{ formatDate(article.updated_at) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Kategori</span>
          <span class="info-value">{{ article.category?.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tipe Dokumen</span>
          <span class="info-value">{{ article.type }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Penulis</span>
          <span class="info-value">
            <router-link
              v-if="article.user?.id"
              :to="{ name: 'AuthorProfile', params: { id: article.user.id } }"
              class="author-link-sidebar"
            >
              {{ article.user.name }}
            </router-link>
            <span v-else>-</span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Visibilitas</span>
          <span class="info-value">
            <span v-if="article.visibility === 'private'" class="visibility-text private">
              🔒 Private
            </span>
            <span v-else class="visibility-text public">
              🌐 Public
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Access Info (hanya untuk private articles) -->
    <div v-if="article && article.visibility === 'private'" class="sidebar-card access-card">
      <h3 class="sidebar-title">🔐 Akses Terbatas</h3>
      <div class="access-list">
        <div v-if="article.divisions && article.divisions.length > 0" class="access-group">
          <span class="access-group-label">Divisi:</span>
          <div class="access-items">
            <span v-for="div in article.divisions" :key="div.id" class="access-item">
              {{ div.name }}
            </span>
          </div>
        </div>
        <div v-if="article.departments && article.departments.length > 0" class="access-group">
          <span class="access-group-label">Departemen:</span>
          <div class="access-items">
            <span v-for="dept in article.departments" :key="dept.id" class="access-item">
              {{ dept.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// Props
const props = defineProps({
  article: {
    type: Object,
    default: null
  },
  relatedArticles: {
    type: Array,
    default: () => []
  },
  pageSize: {
    type: Number,
    default: 5
  }
})

// Pagination
const currentPage = ref(1)

// Computed
const paginatedRelatedArticles = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return props.relatedArticles.slice(start, end)
})

// Methods
const handlePageChange = (page) => {
  currentPage.value = page

  // Smooth scroll to sidebar
  nextTick(() => {
    const sidebar = document.querySelector('.sidebar-card')
    if (sidebar) {
      sidebar.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}

const getTagType = (type) => {
  const typeMap = {
    'SOP': 'danger',
    'Panduan': 'success',
    'Tutorial': 'primary',
    'Kebijakan': 'warning',
    'Artikel': 'info'
  }
  return typeMap[type] || 'info'
}
</script>

<style scoped>
/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.no-related {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 1rem;
  font-size: 0.875rem;
}

.related-articles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.related-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateX(4px);
}

.related-title {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  word-break: break-word;
}

.author-link-sidebar {
  color: #111827;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.author-link-sidebar:hover {
  color: #2563eb;
}

.visibility-text {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.visibility-text.private {
  background: #fef3c7;
  color: #92400e;
}

.visibility-text.public {
  background: #dbeafe;
  color: #1e40af;
}

.access-card {
  background: linear-gradient(135deg, #fef9e7 0%, #ffffff 100%);
}

.access-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.access-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.access-group-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #78350f;
}

.access-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.access-item {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #fbbf24;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    order: 2;
  }
}

@media (max-width: 768px) {
  .sidebar-card {
    padding: 1rem;
  }

  .related-title {
    font-size: 0.8rem;
  }
}
</style>

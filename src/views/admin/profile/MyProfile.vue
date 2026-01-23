<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>My Profile</span>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- Avatar Section -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img
                v-if="profile.avatar_url"
                :src="profile.avatar_url"
                alt="Avatar"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <el-icon :size="60"><i-ep-User /></el-icon>
              </div>
            </div>
            <div class="avatar-actions">
              <el-upload
                :show-file-list="false"
                :before-upload="handleAvatarUpload"
                accept="image/jpeg,image/jpg,image/png"
              >
                <el-button type="primary" size="small" :loading="uploadingAvatar">
                  <el-icon class="mr-1"><i-ep-Upload /></el-icon>
                  Upload Avatar
                </el-button>
              </el-upload>
              <el-button
                v-if="profile.avatar"
                type="danger"
                size="small"
                plain
                @click="handleDeleteAvatar"
                :loading="deletingAvatar"
              >
                <el-icon class="mr-1"><i-ep-Delete /></el-icon>
                Remove
              </el-button>
            </div>
            <div class="avatar-tips">
              <el-text size="small" type="info">
                Allowed: JPG, JPEG, PNG (Max: 2MB)
              </el-text>
            </div>
          </div>
        </el-col>

        <!-- Form Section -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <!-- Basic Info Tab -->
            <el-tab-pane label="Basic Information" name="basic">
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="120px"
                label-position="top"
              >
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="Name" prop="name">
                      <el-input v-model="profileForm.name" placeholder="Enter your name" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="Email" prop="email">
                      <el-input v-model="profileForm.email" placeholder="Enter your email" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="Position">
                      <el-input v-model="profileForm.position" placeholder="Enter your position" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="Role">
                      <el-input :value="profile.role" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="Moto" prop="moto">
                  <el-input
                    v-model="profileForm.moto"
                    type="textarea"
                    :rows="3"
                    placeholder="Enter your moto or tagline"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdateProfile" :loading="updatingProfile">
                    Save Changes
                  </el-button>
                  <el-button @click="resetProfileForm">Reset</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Change Password Tab -->
            <el-tab-pane label="Change Password" name="password">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="180px"
                label-position="top"
              >
                <el-form-item label="Current Password" prop="current_password">
                  <el-input
                    v-model="passwordForm.current_password"
                    type="password"
                    placeholder="Enter current password"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="New Password" prop="new_password">
                  <el-input
                    v-model="passwordForm.new_password"
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="Confirm New Password" prop="new_password_confirmation">
                  <el-input
                    v-model="passwordForm.new_password_confirmation"
                    type="password"
                    placeholder="Confirm new password"
                    show-password
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword" :loading="updatingPassword">
                    Update Password
                  </el-button>
                  <el-button @click="resetPasswordForm">Reset</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProfile, updateProfile, updatePassword, uploadAvatar, deleteAvatar } from '@/api/profile'
import { dispatch } from '@/store'

const activeTab = ref('basic')
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const profile = reactive({
  name: '',
  email: '',
  role: '',
  position: '',
  moto: '',
  avatar: '',
  avatar_url: ''
})

const profileForm = reactive({
  name: '',
  email: '',
  position: '',
  moto: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const updatingProfile = ref(false)
const updatingPassword = ref(false)
const uploadingAvatar = ref(false)
const deletingAvatar = ref(false)

const profileRules = {
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
    { max: 255, message: 'Name cannot exceed 255 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  moto: [
    { max: 500, message: 'Moto cannot exceed 500 characters', trigger: 'blur' }
  ]
}

const passwordRules = {
  current_password: [
    { required: true, message: 'Please enter current password', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' }
  ],
  new_password_confirmation: [
    { required: true, message: 'Please confirm new password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const fetchProfile = async () => {
  try {
    const response = await getProfile()
    const userData = response.data.data || response.data
    Object.assign(profile, userData)
    Object.assign(profileForm, {
      name: userData.name || '',
      email: userData.email || '',
      position: userData.position || '',
      moto: userData.moto || ''
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    ElMessage.error('Failed to load profile')
  }
}

const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value.validate()
    updatingProfile.value = true

    const response = await updateProfile(profileForm)
    const userData = response.data.data || response.data

    Object.assign(profile, userData)

    // Update user info in store
    dispatch.user.updateInfo(userData)

    ElMessage.success('Profile updated successfully')
  } catch (error) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      Object.keys(errors).forEach(key => {
        ElMessage.error(errors[key][0])
      })
    } else if (error !== false) {
      ElMessage.error('Failed to update profile')
    }
  } finally {
    updatingProfile.value = false
  }
}

const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    updatingPassword.value = true

    await updatePassword(passwordForm)

    ElMessage.success('Password updated successfully')
    resetPasswordForm()
  } catch (error) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      Object.keys(errors).forEach(key => {
        ElMessage.error(errors[key][0])
      })
    } else if (error !== false) {
      ElMessage.error('Failed to update password')
    }
  } finally {
    updatingPassword.value = false
  }
}

const handleAvatarUpload = async (file) => {
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Avatar must be JPG, JPEG or PNG format!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Avatar size cannot exceed 2MB!')
    return false
  }

  try {
    uploadingAvatar.value = true
    const response = await uploadAvatar(file)
    const avatarData = response.data.data || response.data

    profile.avatar_url = avatarData.avatar
    profile.avatar = avatarData.avatar

    dispatch.user.updateInfo({ avatar_url: avatarData.avatar })

    ElMessage.success('Avatar uploaded successfully')
  } catch (error) {
    console.error('Upload error:', error)
    ElMessage.error('Failed to upload avatar')
  } finally {
    uploadingAvatar.value = false
  }

  return false
}

const handleDeleteAvatar = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to remove your avatar?',
      'Confirmation',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    deletingAvatar.value = true
    await deleteAvatar()
    profile.avatar_url = null
    profile.avatar = null

    // Update user info in store
    dispatch.user.updateInfo({ avatar_url: null })

    ElMessage.success('Avatar removed successfully')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to remove avatar')
    }
  } finally {
    deletingAvatar.value = false
  }
}

const resetProfileForm = () => {
  Object.assign(profileForm, {
    name: profile.name,
    email: profile.email,
    position: profile.position,
    moto: profile.moto
  })
  profileFormRef.value?.clearValidate()
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })
  passwordFormRef.value?.clearValidate()
}

onMounted(() => {
  fetchProfile()
})
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;

  .profile-card {
    max-width: 1200px;
    margin: 0 auto;

    .card-header {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;

    .avatar-wrapper {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #f0f0f0;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .avatar-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 200px;

      :deep(.el-button) {
        width: 100%;
      }
    }

    .avatar-tips {
      margin-top: 15px;
      text-align: center;
    }
  }

  .profile-tabs {
    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }

  .mr-1 {
    margin-right: 4px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;

    .avatar-section {
      margin-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 20px;
    }

    :deep(.el-form-item__label) {
      font-size: 14px;
    }
  }
}
</style>

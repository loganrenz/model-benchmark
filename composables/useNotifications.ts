/**
 * Composable for showing toast notifications
 * Uses Nuxt UI's notification system
 */
export function useNotifications() {
  const toast = useToast()

  const showSuccess = (message: string) => {
    toast.add({
      title: 'Success',
      description: message,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
  }

  const showError = (message: string) => {
    toast.add({
      title: 'Error',
      description: message,
      color: 'red',
      icon: 'i-heroicons-exclamation-circle'
    })
  }

  const showInfo = (message: string) => {
    toast.add({
      title: 'Info',
      description: message,
      color: 'blue',
      icon: 'i-heroicons-information-circle'
    })
  }

  const showWarning = (message: string) => {
    toast.add({
      title: 'Warning',
      description: message,
      color: 'yellow',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}


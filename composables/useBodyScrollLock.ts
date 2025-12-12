export function useBodyScrollLock() {
  let scrollY = 0

  const lock = () => {
    if (import.meta.server) return
    const body = document.body
    if (body.dataset.scrollLocked === 'true') return

    scrollY = window.scrollY || 0
    body.dataset.scrollLocked = 'true'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
  }

  const unlock = () => {
    if (import.meta.server) return
    const body = document.body
    if (body.dataset.scrollLocked !== 'true') return

    body.dataset.scrollLocked = 'false'
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    body.style.overflow = ''
    body.style.touchAction = ''
    window.scrollTo(0, scrollY)
  }

  return { lock, unlock }
}


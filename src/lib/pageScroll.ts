// code from: https://github.com/flekschas/svelte-simple-modal/blob/master/src/Modal.svelte
let scrollY: number
let prevBodyPosition: string
let prevBodyOverflow: string
let prevBodyWidth: string

export function disablePageScroll() {
  scrollY = window.scrollY
  prevBodyPosition = document.body.style.position
  prevBodyOverflow = document.body.style.overflow
  prevBodyWidth = document.body.style.width
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.overflow = 'hidden'
  document.body.style.width = '100%'
}

export function enablePageScroll() {
  document.body.style.position = prevBodyPosition || ''
  document.body.style.top = ''
  document.body.style.overflow = prevBodyOverflow || ''
  document.body.style.width = prevBodyWidth || ''
  window.scrollTo({
    top: scrollY,
    left: 0,
    // @ts-ignore
    behavior: 'instant'
  })
}

import { cn } from '@/lib/utils'
import React from 'react'

const Container = ({children, className}) => {
  return (
    <section className={cn('w-full min-h-[85vh] pt-3', className)}>
      {children}
    </section>
  )
}

export default Container
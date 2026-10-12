import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = Dialog.Root
const SheetTrigger = Dialog.Trigger
const SheetClose = Dialog.Close
const SheetTitle = Dialog.Title
const SheetDescription = Dialog.Description

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof Dialog.Content>) {
  return <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/65" />
    <Dialog.Content className={cn('fixed inset-y-0 right-0 z-50 w-[min(85vw,360px)] bg-background p-7 text-foreground shadow-xl', className)} {...props}>
      {children}
      <Dialog.Close className="absolute right-5 top-5 flex size-11 items-center justify-center" aria-label="Close menu"><X size={24} /></Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription }

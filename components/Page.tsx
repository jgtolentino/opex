import * as React from 'react'

import { PageHead } from './PageHead'

interface PageProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function Page({
  children,
  title = 'OpEx Portal',
  description = 'Operational Excellence Hub'
}: PageProps) {
  return (
    <>
      <PageHead title={title} description={description} />
      <div className="notion-app">{children}</div>
    </>
  )
}

import React from 'react'
import { NextPage } from 'next'

const Footer = ({ href, text }: { href: string; text: string }) => (
  <footer className="relative bottom-0 w-full h-30 mb-2 flex flex-row justify-center items-center">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex justify-center items-center"
    >
      {text}
    </a>
  </footer>
)

const Layout: NextPage<{}> = ({ children }) => {
  return (
    <>
      <main className="min-h-full">
        {children}
      </main>
      <Footer href="https://github.com/rjoydip" text="Powered by rjoydip" />
      <style jsx>{``}</style>
    </>
  )
}
export { Layout }

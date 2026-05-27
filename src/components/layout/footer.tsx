import Link from 'next/link'

const footerLinks = {
  institucional: [
    { href: '/sobre', label: 'Sobre Nós' },
    { href: '/parceiro', label: 'Seja Parceiro' },
  ],
  produtos: [
    { href: '/produtos?categoria=seguranca', label: 'Linha Segurança' },
    { href: '/produtos?categoria=tradicionais', label: 'Linha Tradicional' },
    { href: '/produtos?categoria=acessorios', label: 'Acessórios' },
  ],
  contato: [
    { label: 'Mogi Guaçu - SP' },
    { label: 'comercial@pradocalcados.com.br' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-marinho text-branco">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <img
              src="/logo-principal.png"
              alt="Prado Calçados Logo"
              className="h-10 w-auto"
            />
            {/* <h3 className="text-lg font-bold">PRADO CALÇADOS</h3> */}
            <p className="text-sm text-bege/80 leading-relaxed">
              Desde 1994, fabricando botinas e botas com durabilidade comprovada
              e reposição rápida para o seu negócio.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-safety uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bege/70 hover:text-branco transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-safety uppercase tracking-wider">
              Produtos
            </h4>
            <ul className="space-y-2">
              {footerLinks.produtos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bege/70 hover:text-branco transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-safety uppercase tracking-wider">
              Contato
            </h4>
            <ul className="space-y-2">
              {footerLinks.contato.map((item, i) => (
                <li key={i} className="text-sm text-bege/70">
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-bege/20 text-center">
          <p className="text-sm text-bege/50">
            &copy; {new Date().getFullYear()} Prado Calçados. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

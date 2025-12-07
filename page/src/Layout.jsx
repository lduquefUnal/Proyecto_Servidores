import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import logoSrc from './assets/Logo.png';

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'Reconocedor de Dígitos', href: '/reconocedor-digitos', current: false },
  { name: 'Detector de Neumonía', href: '/detector-neumonia', current: false },
  { name: 'Análisis de Sentimiento', href: '/analisis-sentimiento', current: false },
  { name: 'Quiénes Somos', href: '/quienes-somos', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

import TechLogos from './components/TechLogos';

function Layout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-200">
      {/* HEADER / NAVEGACIÓN */}
      <Disclosure as="header" className="bg-gray-800/50 backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10 sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Botón del menú móvil */}
                  <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Abrir menú principal</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex shrink-0 items-center">
                    <img
                      alt="Logo"
                      src={logoSrc}
                      className="h-9 w-auto"
                    />
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            location.pathname === item.href ? 'bg-gray-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          aria-current={location.pathname === item.href ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <button
                    type="button"
                    onClick={handleThemeSwitch}
                    className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Toggle theme</span>
                    {theme === 'light' ? (
                      <MoonIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <SunIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 ml-3"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="relative flex rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-700' : '',
                              'block px-4 py-2 text-sm text-gray-300'
                            )}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-700' : '',
                              'block px-4 py-2 text-sm text-gray-300'
                            )}
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-700' : '',
                              'block px-4 py-2 text-sm text-gray-300'
                            )}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    as={Link}
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href ? 'bg-gray-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Tech Logos Section */}
      <TechLogos />

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 Portafolio de Modelos IA</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
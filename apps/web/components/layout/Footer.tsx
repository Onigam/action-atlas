import { Github, Twitter, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

import { ROUTES, EXTERNAL_LINKS } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900">
              Action Atlas
            </h3>
            <p className="mt-2 text-sm text-gray-600 max-w-md">
              AI-powered semantic search for discovering meaningful volunteering
              activities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.SEARCH}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Search Activities
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ABOUT}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CONTACT}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Heart className="h-4 w-4 fill-primary-500 text-primary-500" />
            <span>&copy; {currentYear} Action Atlas. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-4">
            <a
              href={EXTERNAL_LINKS.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={EXTERNAL_LINKS.TWITTER}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={EXTERNAL_LINKS.SUPPORT}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

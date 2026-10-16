function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} StreamManage. Tous droits réservés.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary-600 transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

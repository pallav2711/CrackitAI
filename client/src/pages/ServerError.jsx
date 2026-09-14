import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Seo from '../components/seo/Seo';
import { SUPPORT_EMAIL } from '../brand/config';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <Seo page="serverError" />
      <div className="max-w-md w-full nb-card-compat text-center space-y-5">
        <div className="flex justify-center">
          <Logo size="lg" variant="navy" />
        </div>
        <p className="text-sm font-semibold text-brand-muted">500</p>
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-brand-muted">
          The page could not be loaded. Try again in a moment, or contact {SUPPORT_EMAIL} if this continues.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn btn-primary">Home</Link>
          <Link to="/contact" className="btn btn-ghost">Contact</Link>
        </div>
      </div>
    </div>
  );
}

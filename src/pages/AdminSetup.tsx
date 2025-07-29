import { AdminUserCreator } from '@/components/AdminUserCreator';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminSetup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <AdminUserCreator />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Once created, you can access the admin panel at <Link to="/admin" className="text-primary hover:underline">/admin</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
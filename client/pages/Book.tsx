import HomeLayout from '@/components/HomeLayout';
import { Flag } from 'lucide-react';

export default function Book() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Flag className="text-primary" size={32} />
            <h1 className="text-4xl font-bold text-foreground">Book a Tee Time</h1>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-border">
            <p className="text-lg text-muted-foreground mb-4">
              Coming soon! This page will allow you to book tee times directly from our partner courses.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, you can browse available courses on the home page and use the booking interface there.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

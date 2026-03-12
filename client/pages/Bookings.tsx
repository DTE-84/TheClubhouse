import HomeLayout from '@/components/HomeLayout';
import { Bookmark } from 'lucide-react';

export default function Bookings() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="text-primary" size={32} />
            <h1 className="text-4xl font-bold text-foreground">My Bookings</h1>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-border">
            <p className="text-lg text-muted-foreground mb-4">
              Coming soon! Your booked tee times will appear here.
            </p>
            <p className="text-sm text-muted-foreground">
              Once you book a tee time, you'll be able to view, modify, or cancel your reservations from this page.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

import { CheckoutWizard } from '../components/CheckoutWizard.jsx';

export function CheckoutPage({ onNavigate }) {
  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Secure Order Checkout
        </h1>
        <p className="text-xs text-slate-500">Complete your shipping and payment details to place your order</p>
      </div>

      <CheckoutWizard onNavigate={onNavigate} />
    </div>
  );
}

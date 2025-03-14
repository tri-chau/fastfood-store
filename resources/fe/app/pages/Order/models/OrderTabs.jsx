import React from 'react';

const OrderTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'wait-confirmation', label: 'Confirmating' },
    { id: 'in-progress', label: 'In progress' },
    { id: 'delivering', label: 'Delivering' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

    console.log(activeTab);

    return (
        <div className="flex flex-col mb-4 border-b border-gray-200 dark:border-gray-700 mt-6">
          <ul className="flex flex-wrap flex-col gap-3 -mb-px text-sm font-semibold text-center">
            {tabs.map((tab) => (
              <li key={tab.id} className="me-2 flex justify-end">
                <button
                  className={`shadow-lg inline-flex items-center px-4 py-3 rounded-lg w-[180px] ${activeTab === tab.id ? 'active' : ''}`}
                  id={`${tab.id}-tab`}
                  type="button"
                  aria-controls={`${tab.id}-content`}
                  aria-selected={activeTab === tab.id}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
  );
};

export default OrderTabs;

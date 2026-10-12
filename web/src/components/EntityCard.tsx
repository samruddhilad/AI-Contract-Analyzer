import React from 'react';
import { Users, Calendar, DollarSign, Clock, Mail, Tag, Phone, Home } from 'lucide-react';
import type { EntityMap } from '../types/contract';

interface EntityCardProps {
  entities: EntityMap;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entities }) => {
  const entityCategories = [
    {
      title: 'Identified Parties',
      icon: <Users size={18} color="var(--color-primary)" />,
      items: entities.parties || [],
      emptyMessage: 'No specific party names isolated',
    },
    {
      title: 'Properties & Units',
      icon: <Home size={18} color="#10b981" />,
      items: entities.properties || [],
      emptyMessage: 'No specific units/properties isolated',
    },
    {
      title: 'Important Dates',
      icon: <Calendar size={18} color="#0284c7" />,
      items: entities.dates || [],
      emptyMessage: 'No dates detected',
    },
    {
      title: 'Financial Terms & Amounts',
      icon: <DollarSign size={18} color="var(--color-risk-low)" />,
      items: entities.money || [],
      emptyMessage: 'No monetary amounts detected',
    },
    {
      title: 'Phone Contacts',
      icon: <Phone size={18} color="#06b6d4" />,
      items: entities.phones || [],
      emptyMessage: 'No phone numbers detected',
    },
    {
      title: 'Duration & Terms',
      icon: <Clock size={18} color="#8b5cf6" />,
      items: entities.durations || [],
      emptyMessage: 'No term duration specified',
    },
    {
      title: 'Email Addresses',
      icon: <Mail size={18} color="#f59e0b" />,
      items: entities.emails || [],
      emptyMessage: 'No email contacts found',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
          }}
        >
          <Tag size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem' }}>Key Extracted Information</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Named entities extracted across the document text
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '16px' }}>
        {entityCategories.map((cat, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  display: 'flex',
                }}
              >
                {cat.icon}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{cat.title}</h4>
            </div>

            {cat.items.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cat.items.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'var(--color-bg-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {cat.emptyMessage}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

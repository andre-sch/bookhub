'use client';

import { useState } from 'react';
import { post } from '../api';
import styles from './ReserveModal.module.css';
import { toast } from 'sonner';

interface ReserveModalProps {
  item: {
    ID: string;
  };
  onClose: () => void;
}

export function ReserveModal({ item, onClose }: ReserveModalProps) {

  function toTimestamp(dateStr: string, timeStr: string) {
    return new Date(`${dateStr}T${timeStr}:00`).getTime();
  }

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [reserveCode, setReserveCode] = useState('');

  const today = new Date().toISOString().split("T")[0]; 
  const [reserveData, setReserveData] = useState({
    startDate: today,
    startTime: '15:00',
    endDate: today,
    endTime: '15:00'
  });

  const handleSubmit = async () => {
    try {
      const startTimestamp = toTimestamp(reserveData.startDate, reserveData.startTime);
      const endTimestamp = toTimestamp(reserveData.endDate, reserveData.endTime);

      if (endTimestamp <= startTimestamp) {
        toast.error("A data e hora de término devem ser maiores que as de início.");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await post('/reservations', {
        itemID: item.ID,
        startAt: startTimestamp,
        endAt: endTimestamp,
      }, token);

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao criar reserva.');
        return;
      }

      const data = await response.json();
      setReserveCode(data.code);
      setStep('success');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {step === 'form' ? (
          <div className={styles.content}>
            <button onClick={onClose} className={styles.closeButton}>
              ×
            </button>

            <h2 className={styles.title}>Reserva</h2>

            <p className={styles.description}>
              Para efetuar o empréstimo você deverá comparecer na biblioteca dentro do prazo especificado abaixo.
            </p>

            <div className={styles.formContainer}>
              <div className={styles.dateTimeGrid}>
                <div className={styles.headerRow}>
                  <label className={styles.columnHeader}>Data</label>
                  <label className={styles.columnHeader}>Hora</label>
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Início:</label>
                    <input
                      type="date"
                      required
                      value={reserveData.startDate}
                      onChange={(e) => setReserveData({ ...reserveData, startDate: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelHidden}>Hora</label>
                    <input
                      type="time"
                      required
                      value={reserveData.startTime}
                      onChange={(e) => setReserveData({ ...reserveData, startTime: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Fim:</label>
                    <input
                      type="date"
                      required
                      value={reserveData.endDate}
                      onChange={(e) => setReserveData({ ...reserveData, endDate: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelHidden}>Hora</label>
                    <input
                      type="time"
                      required
                      value={reserveData.endTime}
                      onChange={(e) => setReserveData({ ...reserveData, endTime: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleSubmit} className={styles.confirmButton}>
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.successContent}>
            <button onClick={onClose} className={styles.closeButton}>
              ×
            </button>

            <div className={styles.checkmarkCircle}>
              <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                <path 
                  d="M2 15L15 28L38 2" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className={styles.successTitle}>Reservado com Sucesso!</h2>

            <div className={styles.reserveInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Código da Reserva:</span>
                <span className={styles.infoValue}>{reserveCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Identificador do Exemplar:</span>
                <span className={styles.infoValue}>{item.ID.slice(0,8)}</span>
              </div>
            </div>

            <button onClick={onClose} className={styles.closeButtonBottom}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
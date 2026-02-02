import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close, LocalShipping } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

const LoanRequestModal = ({ open, onClose, book, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    phone: '',
    deliveryAddress: '',
    deliveryNotes: '',
    preferredPickupDate: null
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      preferredPickupDate: date
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9+\s-]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'L\'adresse de livraison est requise';
    } else if (formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = 'L\'adresse doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const submitData = {
      ...formData,
      preferredPickupDate: formData.preferredPickupDate
        ? formData.preferredPickupDate.format('YYYY-MM-DD')
        : null
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      phone: '',
      deliveryAddress: '',
      deliveryNotes: '',
      preferredPickupDate: null
    });
    setErrors({});
    onClose();
  };

  if (!book) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          borderTop: '4px solid #78350f'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping sx={{ color: '#78350f' }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: '#292524' }}>
              Demande d'emprunt
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#78716c' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Vous demandez à emprunter: <strong>{book.title}</strong>
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Numéro de téléphone"
            placeholder="Ex: +213 555 123 456"
            value={formData.phone}
            onChange={handleChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            required
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />

          <TextField
            label="Adresse de livraison"
            placeholder="Votre adresse complète..."
            value={formData.deliveryAddress}
            onChange={handleChange('deliveryAddress')}
            error={!!errors.deliveryAddress}
            helperText={errors.deliveryAddress}
            fullWidth
            required
            multiline
            rows={3}
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />

          <TextField
            label="Notes de livraison (optionnel)"
            placeholder="Instructions spéciales, heures de disponibilité..."
            value={formData.deliveryNotes}
            onChange={handleChange('deliveryNotes')}
            fullWidth
            multiline
            rows={2}
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
            <DatePicker
              label="Date de retrait souhaitée (optionnel)"
              value={formData.preferredPickupDate}
              onChange={handleDateChange}
              minDate={dayjs().add(1, 'day')}
              maxDate={dayjs().add(30, 'day')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    sx: { borderRadius: 1.5 }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#78716c' }}>
          Après soumission, vous recevrez un email de confirmation.
          L'emprunt sera activé une fois le livre prêt à être récupéré.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e7e5e4' }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: '#57534e',
            '&:hover': { bgcolor: '#f5f5f4' }
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          sx={{
            bgcolor: '#78350f',
            '&:hover': { bgcolor: '#92400e' },
            '&:disabled': { bgcolor: '#d6d3d1' }
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Soumettre la demande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanRequestModal;

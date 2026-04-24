export interface LeadFormData {
  nombre_negocio: string;
  giro: string;
  ciudad: string;
  descripcion: string;
  problema: string;
  pct_perdidas: string;
  tipo_producto: string;
  canales: string[];
  funciones: string[];
  volumen_mensajes: string;
  nombre_contacto: string;
  whatsapp: string;
  email: string;
  fuente: string;
}

export type FormAction =
  | { type: 'SET_FIELD'; field: keyof LeadFormData; value: string }
  | { type: 'TOGGLE_ARRAY'; field: 'canales' | 'funciones'; value: string }
  | { type: 'RESET' };

export const initialFormData: LeadFormData = {
  nombre_negocio: '',
  giro: '',
  ciudad: '',
  descripcion: '',
  problema: '',
  pct_perdidas: '',
  tipo_producto: '',
  canales: [],
  funciones: [],
  volumen_mensajes: '',
  nombre_contacto: '',
  whatsapp: '',
  email: '',
  fuente: '',
};

export function formReducer(state: LeadFormData, action: FormAction): LeadFormData {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_ARRAY': {
      const current = state[action.field] as string[];
      const exists = current.includes(action.value);
      if (exists) {
        return { ...state, [action.field]: current.filter((v) => v !== action.value) };
      }
      if (action.field === 'funciones' && current.length >= 3) return state;
      return { ...state, [action.field]: [...current, action.value] };
    }
    case 'RESET':
      return { ...initialFormData };
    default:
      return state;
  }
}

import { BillAction, BillState } from '../lib/billTypes';

// สร้าง reducer function
export function billReducer(state: BillState, action: BillAction): BillState {
  switch (action.type) {
    case 'SET_BILL_NAME':
      return { ...state, billName: action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };
    case 'SET_VAT':
      return { ...state, vat: action.payload };
    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload };
    case 'SET_SERVICE_CHARGE':
      return { ...state, serviceCharge: action.payload };
    case 'SET_SPLIT_METHOD':
      return { ...state, splitMethod: action.payload };
    case 'SET_CATEGORY_ID':
      return { ...state, categoryId: action.payload };
    case 'SET_FOOD_ITEMS':
      return { ...state, foodItems: action.payload };
    case 'ADD_FOOD_ITEM':
      return { ...state, foodItems: [...state.foodItems, action.payload] };
    case 'UPDATE_FOOD_ITEM':
      // ตรวจสอบว่าเป็นการเพิ่มรายการอาหารใหม่พร้อมข้อมูลหรือไม่
      if ('isNew' in action.payload && action.payload.isNew === true) {
        // กรณีเป็นรายการอาหารใหม่ ให้เพิ่มเข้าไปในรายการเลย
        const { isNew, ...newFoodItem } = action.payload;
        return {
          ...state,
          foodItems: [...state.foodItems, newFoodItem]
        };
      } else {
        // กรณีเป็นการอัปเดตรายการที่มีอยู่แล้ว
        return {
          ...state,
          foodItems: state.foodItems.map(item =>
            item.id === action.payload.id ? action.payload : item
          ),
        };
      }
    case 'REMOVE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.filter(item => item.id !== action.payload),
      };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.payload],
      };
    case 'UPDATE_PARTICIPANT':
      // ตรวจสอบว่าเป็นการเพิ่มผู้เข้าร่วมใหม่พร้อมชื่อหรือไม่
      if ('isNew' in action.payload && action.payload.isNew === true) {
        // กรณีเป็นผู้เข้าร่วมใหม่ ให้เพิ่มเข้าไปในรายการเลย
        const { isNew, ...newParticipant } = action.payload;
        
        // ถ้าเป็นโหมดหารเท่ากัน ให้เพิ่มผู้เข้าร่วมใหม่ในทุกรายการอาหาร
        if (state.splitMethod === 'equal' && state.foodItems.length > 0) {
          const updatedFoodItems = state.foodItems.map(item => ({
            ...item,
            participants: [...item.participants, newParticipant.id]
          }));
          
          return {
            ...state,
            participants: [...state.participants, newParticipant],
            foodItems: updatedFoodItems
          };
        }
        
        return {
          ...state,
          participants: [...state.participants, newParticipant]
        };
      } else {
        // กรณีเป็นการอัปเดตผู้เข้าร่วมที่มีอยู่แล้ว
        return {
          ...state,
          participants: state.participants.map(p =>
            p.id === action.payload.id ? action.payload : p
          ),
        };
      }
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload),
        // ลบผู้เข้าร่วมออกจากรายการอาหารทั้งหมดด้วย
        foodItems: state.foodItems.map(item => ({
          ...item,
          participants: item.participants.filter(id => id !== action.payload)
        }))
      };
    case 'SET_SPLIT_RESULTS':
      return { ...state, splitResults: action.payload };
    case 'SET_BILLS':
      return { ...state, bills: action.payload };
    case 'ADD_BILLS':
      return { ...state, bills: [...state.bills, ...action.payload] };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'RESET_BILL':
      return {
        ...state,
        billName: '',
        totalAmount: 0,
        vat: 0,
        discount: 0,
        serviceCharge: 0,
        splitMethod: 'equal',
        categoryId: 'food',
        foodItems: [],
        participants: [],
        splitResults: [],
        // คงค่าบิลและการแสดง toast ไว้
        bills: state.bills,
        toast: state.toast
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
} 
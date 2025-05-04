import { BillAction, BillState, FoodItemWithFlag } from '../lib/billTypes';

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
      // ตรวจสอบว่าเป็นการเพิ่มรายการอาหารใหม่หรือไม่
      if (action.payload.isNew) {
        // ถ้าเป็นรายการอาหารใหม่ ให้เพิ่มลงในรายการ
        const { isNew, ...newItem } = action.payload;
        return {
          ...state,
          foodItems: [...state.foodItems, newItem]
        };
      }
      // อัปเดตรายการอาหารที่มีอยู่แล้ว
      return {
        ...state,
        foodItems: state.foodItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'REMOVE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.filter(item => item.id !== action.payload)
      };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    case 'UPDATE_PARTICIPANT':
      // เช็คว่ามีการเพิ่มผู้เข้าร่วมใหม่
      if (action.payload.isNew) {
        // ถ้าเป็นผู้เข้าร่วมใหม่ ให้เพิ่มลงในรายการ
        return {
          ...state,
          participants: [...state.participants, {
            id: action.payload.id,
            name: action.payload.name,
            status: action.payload.status || 'pending',
          }]
        };
      }
      // อัปเดตผู้เข้าร่วมที่มีอยู่แล้ว
      return {
        ...state,
        participants: state.participants.map(participant =>
          participant.id === action.payload.id
            ? {
                id: participant.id,
                name: action.payload.name,
                status: action.payload.status || participant.status
              }
            : participant
        )
      };
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(participant => participant.id !== action.payload)
      };
    case 'SET_SPLIT_RESULTS':
      return { ...state, splitResults: action.payload };
    case 'SET_BILLS':
      return { ...state, bills: action.payload };
    case 'ADD_BILLS':
      return { ...state, bills: [...state.bills, ...action.payload] };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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
        splitResults: []
      };
    // กลุ่มผู้เข้าร่วม
    case 'SET_PARTICIPANT_GROUPS':
      return { ...state, participantGroups: action.payload };
    case 'ADD_PARTICIPANT_GROUP':
      return { 
        ...state, 
        participantGroups: [
          ...(state.participantGroups || []), 
          action.payload
        ] 
      };
    case 'REMOVE_PARTICIPANT_GROUP':
      return {
        ...state,
        participantGroups: (state.participantGroups || []).filter(
          group => group.id !== action.payload
        )
      };
    default:
      return state;
  }
} 
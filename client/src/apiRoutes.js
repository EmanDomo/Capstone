const useProduction = true; // Change to false to use localhost

export const host = useProduction
  ? "https://api.sjisc-canteen.online"
  : "http://localhost:3000"; 
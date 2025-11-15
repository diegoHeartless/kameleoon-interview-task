import { useQuery } from '@tanstack/react-query'

function useGetData() {
  const { data, isPending, error } = useQuery({
    queryKey: ['getdata'],
    queryFn: () => fetch('http://localhost:3001/data').then(r => r.json()),
  })

  

  return data
}

export default useGetData
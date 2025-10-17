import CartButton from '@/components/CartButton';
import Filter from '@/components/Filter';
import MenuCard from '@/components/MenuCard';
import SearchBar from '@/components/SearchBar';
import { getCategories, getMenu } from '@/lib/appwrite';
import useAppwrite from '@/lib/useAppwrite';
import { Category, MenuItem } from '@/type';
import cn from 'clsx';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const {query, category} = useLocalSearchParams<{query: string; category: string}>();
  console.log('Search component - category:', category, 'query:', query);
  const { data,refetch,loading} = useAppwrite({fn: getMenu,params: {category,query, limit: 16,}});
   useEffect(() => { 
     console.log('useEffect triggered - refetching with limit 6');
     refetch({category, query,limit: 6,})
   
  }, [query, category]);

  const {data: categories} = useAppwrite({ fn: getCategories });
   console.log('Menu data:', data);
   console.log('Number of menu items:', data?.length || 0);
  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
                data={data} 
                renderItem={({ item, index }) => {
                  const isFirstRightColItem = index % 2 === 0;

                  return (
                      <View className={cn("flex-1 max-w-[48%]", !isFirstRightColItem ? 'mt-10': 'mt-0')}>
                          <MenuCard item={item as unknown as MenuItem} />
                      </View>
                  )
                  }} 
                  keyExtractor={item => item.$id}
                  numColumns={2}
                  columnWrapperClassName="gap-7"
                  contentContainerClassName="gap-7 px-5 pb-32"
                  ListHeaderComponent={() => (
                    <View className="my-5 gap-5">
                      <View className="flex-between flex-row w-full">
                         <View className="flex-start">
                          <Text className="small-bold uppercase text-primary">Search</Text>
                          <View className="flex-start flex-row flex-gap-x-1 mt-0.5">
                          <Text className="paragraph-bold">Find your favorite food</Text>
                          </View>
                         </View>
                         <CartButton />
                      </View>




                      <SearchBar/>
                      <Filter categories={categories as unknown as Category[]}/>
                    </View>
                  )}
                  ListEmptyComponent={() => !loading && <Text>No results</Text>}
                />
    </SafeAreaView>
  )
}

export default Search
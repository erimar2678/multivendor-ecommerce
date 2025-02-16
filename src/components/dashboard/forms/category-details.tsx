'use client'
// Prisma model
import { Category } from '@prisma/client'

// React
import {FC, useEffect} from "react";

// Form handling utilities
import * as z from 'zod'
import {useForm} from "react-hook-form";
import {CategoryFormSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {AlertDialog} from "@/components/ui/alert-dialog";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface CategoryDetailsProps {
    data?:Category
}

const CategoryDetails:FC<CategoryDetailsProps> = ({ data }) => {
    // form hook for managing form state and validation
    const form = useForm<z.infer<typeof CategoryFormSchema>>({
        mode:'onChange', // form validation mode
        resolver:zodResolver(CategoryFormSchema), // Resolver for form validation
        defaultValues: {
            // Setting default form values from data (if available)
            name: data?.name,
            image: data?.image ? [{url:data?.image}] : [],
            url: data?.url,
            featured: data?.featured,
        }
    })

    // Loading status based on form submission
    const isLoading = form.formState.isSubmitting

    // Reset form values when data changes
    useEffect(() => {
        if (data) {
            form.reset({
                name: data?.name,
                image: [{ url: data?.image }],
                url: data?.url,
                featured: data?.featured
            })
        }
    }, [data, form]);

    // Submit handler for form submission
    const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
        console.log(values)
    }

    return <AlertDialog>
        <Card className={'w-full'}>
            <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>
                    {data?.id
                        ? `Update ${data?.name} category information.`
                        : 'Lets create a category. You can edit category later from the categories table or the category page'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className={'space-y-4'}
                    >
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name={'name'}
                            render={({field}) => (
                                <FormItem className={'flex-1'}>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name={'url'}
                            render={({field}) => (
                                <FormItem className={'flex-1'}>
                                    <FormLabel>Category Url</FormLabel>
                                    <FormControl>
                                        <Input placeholder='/category-url' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name={'featured'}
                            render={({field}) => (
                                <FormItem className={'flex flex-row items-start space-x-3 splace-y-0 rounded-md'}>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className={'space-y-1 leading-none'}>
                                        <FormLabel>Featured Category</FormLabel>
                                        <FormDescription>Featured categories are displayed on the homepage.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type='submit' disabled={isLoading}>
                            {isLoading
                                ? 'loading...'
                                : data?.id
                                    ? 'Save Category Information'
                                    : 'Create Category'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>
}

export default CategoryDetails
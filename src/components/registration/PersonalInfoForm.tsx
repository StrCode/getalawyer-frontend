import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLGAsForState, NIGERIA_STATES } from '@/constants/nigeria-states-lgas';
import {
  GENDER_OPTIONS,
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from '@/constants/registration';
import { usePersonalInfo, useSavePersonalInfo } from '@/hooks/use-registration';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfoFormData } from '@/lib/api/registration';
import { personalInfoSchema } from '@/lib/schemas/registration';
import { cn } from '@/lib/utils';
import { useRegistrationStore } from '@/stores/registration-store';

export function PersonalInfoForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep2Data, setRegistrationStatus, step2Data } = useRegistrationStore();
  const savePersonalInfoMutation = useSavePersonalInfo();
  const { data: existingData, refetch } = usePersonalInfo();

  const [selectedState, setSelectedState] = useState<string>('');
  const [availableLGAs, setAvailableLGAs] = useState<Array<{ code: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      gender: 'male',
      state: '',
      lga: '',
    },
  });

  const watchedState = watch('state');
  const watchedDateOfBirth = watch('dateOfBirth');

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (existingData) {
      setValue('firstName', existingData.firstName || '');
      setValue('lastName', existingData.lastName || '');
      setValue('middleName', existingData.middleName || '');
      setValue('gender', existingData.gender || 'male');
      setValue('state', existingData.state || '');
      setValue('lga', existingData.lga || '');
      
      if (existingData.dateOfBirth) {
        const date = typeof existingData.dateOfBirth === 'string' 
          ? new Date(existingData.dateOfBirth) 
          : existingData.dateOfBirth;
        setValue('dateOfBirth', date);
      }

      if (existingData.state) {
        setSelectedState(existingData.state);
      }
    } else if (step2Data && Object.keys(step2Data).length > 0) {
      if (step2Data.firstName) setValue('firstName', step2Data.firstName);
      if (step2Data.lastName) setValue('lastName', step2Data.lastName);
      if (step2Data.middleName) setValue('middleName', step2Data.middleName);
      if (step2Data.gender) setValue('gender', step2Data.gender);
      if (step2Data.state) {
        setValue('state', step2Data.state);
        setSelectedState(step2Data.state);
      }
      if (step2Data.lga) setValue('lga', step2Data.lga);
      if (step2Data.dateOfBirth) {
        const date = typeof step2Data.dateOfBirth === 'string' 
          ? new Date(step2Data.dateOfBirth) 
          : step2Data.dateOfBirth;
        setValue('dateOfBirth', date);
      }
    }
  }, [existingData, step2Data, setValue]);

  useEffect(() => {
    if (watchedState) {
      setSelectedState(watchedState);
      const lgas = getLGAsForState(watchedState);
      setAvailableLGAs(lgas);
      
      const currentLga = watch('lga');
      const isLgaValid = lgas.some((lga) => lga.code === currentLga);
      if (!isLgaValid) {
        setValue('lga', '');
      }
    } else {
      setAvailableLGAs([]);
    }
  }, [watchedState, setValue, watch]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    console.log('[PersonalInfoForm] onSubmit called with data:', data);
    console.log('[PersonalInfoForm] isSubmitting:', isSubmitting);
    console.log('[PersonalInfoForm] mutation isPending:', savePersonalInfoMutation.isPending);
    
    // Prevent multiple submissions
    if (savePersonalInfoMutation.isPending) {
      console.log('[PersonalInfoForm] Mutation already pending, skipping');
      return;
    }
    
    try {
      updateStep2Data(data);
      console.log('[PersonalInfoForm] Calling mutation...');
      const response = await savePersonalInfoMutation.mutateAsync(data);
      console.log('[PersonalInfoForm] Mutation response:', response);
      setRegistrationStatus(response.registration_status);
      toast({
        title: 'Success',
        description: REGISTRATION_SUCCESS_MESSAGES.PERSONAL_INFO_SAVED,
      });
      navigate({ to: '/register/step3' });
    } catch (error) {
      console.error('[PersonalInfoForm] Error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">Personal Information</h1>
          <p className="mt-2 text-gray-600 text-sm">Provide your personal details for registration</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="required">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            {...register('firstName')}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            aria-required="true"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-red-600 text-sm" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="required">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            {...register('lastName')}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            aria-required="true"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-red-600 text-sm" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name (Optional)</Label>
          <Input
            id="middleName"
            type="text"
            placeholder="Enter your middle name"
            {...register('middleName')}
            aria-invalid={errors.middleName ? 'true' : 'false'}
            aria-describedby={errors.middleName ? 'middleName-error' : undefined}
            className={errors.middleName ? 'border-red-500' : ''}
          />
          {errors.middleName && (
            <p id="middleName-error" className="text-red-600 text-sm" role="alert">
              {errors.middleName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="required">Date of Birth</Label>
          <Popover>
            <PopoverTrigger
              render={(props) => (
                <Button
                  {...props}
                  id="dateOfBirth"
                  variant="outline"
                  type="button"
                  className={cn(
                    'justify-start w-full font-normal text-left',
                    !watchedDateOfBirth && 'text-muted-foreground',
                    errors.dateOfBirth && 'border-red-500'
                  )}
                  aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                  aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error dateOfBirth-help' : 'dateOfBirth-help'}
                  aria-required="true"
                >
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {watchedDateOfBirth ? format(watchedDateOfBirth, 'PPP') : <span>Pick a date</span>}
                </Button>
              )}
            />
            <PopoverContent className="p-0 w-auto" align="start">
              <Calendar
                mode="single"
                selected={watchedDateOfBirth}
                onSelect={(date) => {
                  if (date) {
                    setValue('dateOfBirth', date, { shouldValidate: true });
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
                captionLayout="dropdown"
                startMonth={new Date(1900, 0)}
                endMonth={new Date()}
                defaultMonth={watchedDateOfBirth}
              />
            </PopoverContent>
          </Popover>
          <p id="dateOfBirth-help" className="text-gray-500 text-xs">You must be at least 18 years old</p>
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="text-red-600 text-sm" role="alert">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="required">Gender</Label>
          <Select
            value={watch('gender')}
            onValueChange={(value) => setValue('gender', value as PersonalInfoFormData['gender'], { shouldValidate: true })}
          >
            <SelectTrigger
              id="gender"
              className={cn("w-full", errors.gender ? 'border-red-500' : '')}
              aria-invalid={errors.gender ? 'true' : 'false'}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
              aria-required="true"
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p id="gender-error" className="text-red-600 text-sm" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* State and LGA fields - full width */}
        <div className="space-y-2">
          <Label htmlFor="state" className="required">State</Label>
          <Select
            value={watch('state')}
            onValueChange={(value) => setValue('state', value, { shouldValidate: true })}
          >
            <SelectTrigger
              id="state"
              className={cn("w-full", errors.state ? 'border-red-500' : '')}
              aria-invalid={errors.state ? 'true' : 'false'}
              aria-describedby={errors.state ? 'state-error' : undefined}
              aria-required="true"
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIA_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p id="state-error" className="text-red-600 text-sm" role="alert">
              {errors.state.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lga" className="required">Local Government Area</Label>
          <Select
            value={watch('lga')}
            onValueChange={(value) => setValue('lga', value, { shouldValidate: true })}
            disabled={!selectedState || availableLGAs.length === 0}
          >
            <SelectTrigger
              id="lga"
              className={cn("w-full", errors.lga ? 'border-red-500' : '')}
              aria-invalid={errors.lga ? 'true' : 'false'}
              aria-describedby={errors.lga ? 'lga-error lga-help' : 'lga-help'}
              aria-required="true"
            >
              <SelectValue placeholder={selectedState ? 'Select LGA' : 'Select state first'} />
            </SelectTrigger>
            <SelectContent>
              {availableLGAs.map((lga) => (
                <SelectItem key={lga.code} value={lga.code}>
                  {lga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedState && (
            <p id="lga-help" className="text-gray-500 text-xs">Select a state first</p>
          )}
          {errors.lga && (
            <p id="lga-error" className="text-red-600 text-sm" role="alert">
              {errors.lga.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || savePersonalInfoMutation.isPending}
          className="w-full"
          aria-label="Save personal information and continue to next step"
        >
          {(isSubmitting || savePersonalInfoMutation.isPending) ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </div>
    </form>
  );
}

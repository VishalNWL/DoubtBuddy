import  Axios from '../Utils/Axios.js';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import SummaryAPi from '../Common/SummaryApi.js';
import { Atom } from "react-loading-indicators";

const SubjectRegister = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      school: '',
      class: '',
      subjects: [{ name: '' }],
    },
  });

  const [loading ,setLoading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subjects',
  });

  const onSubmit = async (data) => {
    console.log(data);
    // Convert subjects from [{ name: 'math' }, { name: 'science' }] to ['math', 'science']
    const formattedData = {
      school: data.school,
      Class: data.class,
      subjects: data.subjects.map(subject => subject.name.trim()).filter(name => name),
    };

    
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryAPi.registerSubject,
        data:formattedData
      })
      const result = response;
      console.log('Success:', result);
      alert('Subjects registered successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to register subjects.');
    }

    finally{
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Subject Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">School Id</label>
          <input
            {...register('school', { required: 'School is required' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter school Id"
          />
          {errors.school && <p className="text-red-500">{errors.school.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Class</label>
          <input
            {...register('class', { required: 'Class is required' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter class"
          />
          {errors.class && <p className="text-red-500">{errors.class.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Subjects</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`subjects.${index}.name`, { required: 'Subject name is required' })}
                className="flex-grow border px-3 py-2 rounded"
                placeholder={`Subject ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-3 rounded"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '' })}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
          >
            + Add Subject
          </button>
        </div>

      {loading?
        (
        <div className='w-full bg-blue-600 text-white py-2 rounded flex justify-center h-10 items-center'>
          <div className='scale-50'>
            <Atom color={'#fff'} size='small'/>
          </div>
        </div>
        ):
        (  <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          Submit
        </button>
      )
      }
      </form>
    </div>
  );
};

export default SubjectRegister;

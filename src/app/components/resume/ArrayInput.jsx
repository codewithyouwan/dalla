import InputField from './InputField';

const ArrayInput = ({ label, items, onChange, arrayName, fields, canRemove, onRemove }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {Array.isArray(items) && items.map((item, index) => (
      <div key={index} className="relative mb-4 border-b pb-4">
        {fields ? (
          fields.map((field) => (
            <InputField
              key={field.name}
              label={`${field.label} ${index + 1}`}
              value={typeof item === 'object' ? item[field.name] : item}
              onChange={(e) => onChange(e, index, field.name, arrayName)}
              type="text"
            />
          ))
        ) : (
          <InputField
            label={`${label} ${index + 1}`}
            value={item}
            onChange={(e) => onChange(e, index, 'value', arrayName)}
            type="text"
          />
        )}
        {canRemove && items.length > 1 && (
          <button
            onClick={() => onRemove(index)}
            className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
            title={`Delete this ${arrayName} entry`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    ))}
  </div>
);

export default ArrayInput;
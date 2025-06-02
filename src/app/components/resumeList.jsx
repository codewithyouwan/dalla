import { format } from 'date-fns';

export default function ResumeList({ resumes , number }) {
  // Format date to readable string (e.g., "June 2, 2025, 11:07 AM")
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy, h:mm a');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Modified
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {resumes.map((resume) => (
            <tr
              key={resume.resume_id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => window.open(resume.resume_link, '_blank', 'noopener,noreferrer')}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {number++}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {resume.name || 'Unnamed Resume'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(resume.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(resume.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
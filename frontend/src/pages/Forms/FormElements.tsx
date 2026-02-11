import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PageWrapper from "../../components/common/PageWrapper";
import DropzoneComponent from "../../components/form/form-elements/DropZone";

export default function FormElements() {
  return (
    <PageWrapper>
      <PageMeta
        title="Klasifikasi"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1">
        <div className="space-y-6">
          <DropzoneComponent />
        </div>
      </div>
    </PageWrapper>
  );
}

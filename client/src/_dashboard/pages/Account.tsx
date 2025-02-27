import { Shell } from "@/components/dashboard/shell";
import { Header } from "@/components/dashboard/header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { UserProfileUpdate, UserEmailUpdate, UserPasswordUpdate, UserAccountClose, UserVerifyAccount } from '../components/index'
import { useUserContext } from "@/context/AuthContext";

export default function DashboardAccount() {
  const { user } = useUserContext();
  const isVerified = user.isEmailVerified
  const defaultValues = isVerified ? ["profile", "email", "password", "close"] : ["verify"]

  return (
    <Shell>
      <Header
        title="Account"
        description="Manage your personal and account deatils."
        size="default"
        className="bg-accent rounded-lg px-8 py-3"
      />
      <Accordion type="multiple" defaultValue={defaultValues}>
        <AccordionItem hidden={isVerified} className="bg-accent rounded-lg mb-2" value="verify">
          <AccordionTrigger>Verify your Account</AccordionTrigger>
          <AccordionContent className="px-1">
            <UserVerifyAccount />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem disabled={!isVerified} className="bg-accent rounded-lg mb-2" value="profile">
          <AccordionTrigger>Profile Update</AccordionTrigger>
          <AccordionContent className="px-1">
            <UserProfileUpdate />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem disabled={!isVerified} className="bg-accent rounded-lg mb-2" value="email">
          <AccordionTrigger>Email Update</AccordionTrigger>
          <AccordionContent className="px-1">
            <UserEmailUpdate />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem disabled={!isVerified} className="bg-accent rounded-lg mb-2" value="password">
          <AccordionTrigger>Password Update</AccordionTrigger>
          <AccordionContent className="px-1">
            <UserPasswordUpdate />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem disabled={!isVerified} className="bg-accent rounded-lg mb-2" value="close">
          <AccordionTrigger>Close Account</AccordionTrigger>
          <AccordionContent>
            <UserAccountClose />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Shell>
  );
}
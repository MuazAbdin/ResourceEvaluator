# Microsoft Defender For Cloud – Home Assignment

AWS Security Hub has controls that evaluate the AWS Systems Manager (SSM) service and resources. In this assignment I build an application that checks the following control:

> [SSM.3] Amazon EC2 instances managed by Systems Manager should have an association compliance status of `COMPLIANT`.

#### Evaluated Resource

In this control, the evaluated resource is `AWS::SSM::AssociationCompliance`. However, managed instances are the indirect focus, as they are the targets of the association.

#### Related AWS CLI commands

There are several command that one can use to extract data about the this control, most of them nested under `ssm` command.

> **_Note:_** there is a difference between "Association Status" and "Association Compliance Status", each have different values, our concern is with the "Association Compliance Status".

- `aws ssm describe-association`
- `aws ssm describe-instance-information`
- `aws ssm list-associations`
- `aws ssm list-compliance-items`
- `aws ssm list-compliance-summaries`

I did not find a single command that given the compliance type, which is in our case `Association`, returns all the managed instances with thier "Association Compliance Status". I found that I need to get all the managed instances first, then check the compliance status for each.
To get all the managed instances there are two ways: the first to loop over all the associations to get all the instances targeted by these associations, the second is to directly get all the managed instances in all the nodes. I choose the second way, I find it direct.
So, the commands I used are:

1. `aws ssm describe-instance-information --filters "Key=ResourceType,Values=ManagedInstance"`
   **_Input:_** the `filters` option, to return only managed instances.
   **_Output:_** `InstanceInformationList`, it is a list of objects, each contains instance information, from which I only need the `InstanceId`.
2. `aws ssm list-compliance-items --resource-ids <instanceId>`
   **_Input:_** the `resource-ids` option, its mandatory, else a `ValidationException` is thrown, and we can only specify one resource ID per call.
   **_Output:_** `ComplianceItems`, it is a list of objects, each contains compliance information, from which we need the `Status`.

#### Compliance Detection Algorithm

1. define a `nonCompliantInstances` set.
2. given a list of `InstanceId`,
   - for each id in the list, get its `ComplianceItems` list.
   - for each compliance item, if the status equals `NON_COMPLIANT` add the `InstanceId` to the `nonCompliantInstances` set.
3. output the `nonCompliantInstances` set.

> **_Note:_** an instance my be compliant with one association but non-compliant with another, in this case we consider it non-compliant.

**Run Time Complexity**: we need to loop over all managed instances and for each to loop over all associations, so suppose the `n` is the number managed instances, and `m` is the number of the associations, the run time is `O(m * n)`.

**Space Complexity**: we need to save the non-compliant instances into a `nonCompliantInstances` set, so the space is `O(n)`.

#### Alternative Algorithm

I used a slightly different algorithm, so I can return more detalied information about the instances:

1. define two maps: `compliantInstances` and `nonCompliantInstances`.
   The keys of each map is the `InstanceId`, ans the values are a list of `ComplianceItems` for this instance.
2. given a list of `InstanceId`,
   - for each id in the list, get its `ComplianceItems` list.
   - for each compliance item,
     1. if its status equals `COMPLIANT` append it to the list of the current `InstanceId` in the `compliantInstances` map:
        `compliantInstances[InstanceId].push(item)`
     2. otherwise, if its status equals `NON_COMPLIANT` append it to the list of the current `InstanceId` in the `nonCompliantInstances` map:
        `nonCompliantInstances[InstanceId].push(item)`
3. for each `InstanceId` in `nonCompliantInstances` map keys:
   - for each compliance item related to that `InstanceId`, outputh the following: association name, severity level, status. The output should be like this:
   ```sh
   ╔═════════════════════════════════════════════════════════════════════════════════╗
   ║                       NON-COMPLIANT MANAGED INSTANCES                           ║
   ╟─────────────────────┬─────────────────────────────┬─────────────┬───────────────╢
   ║ InstanceId          │ Association                 │ Severity    │ Status        ║
   ╟─────────────────────┬─────────────────────────────┬─────────────┬───────────────╢
   ║ i-1234567890abcdef0 │ AWS-GatherSoftwareInventory │ UNSPECIFIED │ NON-COMPLIANT ║
   ║ i-1234567890abcdef0 │ AWS-UpdateSSMAgent          │ UNSPECIFIED │ NON-COMPLIANT ║
   ╚═════════════════════╧═════════════════════════════╧═════════════╧═══════════════╝
   ```

#### Project Design

With focus on modularity and extensibility I designed the project as follows:

1. `DataCollector` interface, which can be implemented by any resource data collector. This interface was implemented by `InstanceDataCollector` class which collects the data related to EC2 instances.
2. `DataAnalyzer` inteface, which can be implemented by any class that aims to anaylze the data collected by a data collector. This interface was implemented by `AssociationDataAnalyzer` class which analyzes the data collected about the managed instances to get the compliant instances.
3. `ResultsDisplayer` interface which can be implemented by any class whose job is to display the analysis results, This interface was implemented by `ConsoleDisplayer` class which uses the `console` to dispay the results. Other possible displayers: pdf displayer, web displayer.
4. `SSMClient` is a singleton class which contains an instance of the aws ssm client. we need only a single instance for out application.

![Class Diagram](classDiagram.svg)

> **_Note:_**
> I was thinking to add the following, but because of time constraints, I prefered not to:
>
> - a factory class, according to the user input (a valid resource type), it outputs an evaluator class which composes all the functionalites from other classes needed to completed the evaluation.
> - for exmple, suppose the user inserts `AWS::SSM::AssociationCompliance`, the factory outputs an `AssociationComplianceEvaluator` class which is an implementation of `ResourceEvaluator` interface, this class composes the classes `InstanceDataCollector` and `AssociationDataAnalyzer` and `ConsoleDisplayer`, and uses their functionalites to display the non compliant instances.

#### Source Code

The source code for this project can br found in this GitHub repository:
[Resource Evaluator App](https://github.com/MuazAbdin/ResourceEvaluator.git)

The application is written in [TypeScript](https://www.typescriptlang.org/).

#### Run Instructions

> **_Prerequisites_**
> create `.env` file in the root cloned folder, and define two variables:
> `AWS_REGION` and `AWS_PROFILE`.

1. clone the repository to your local machine.
2. in terminal run `corepack pnpm build`.
3. in terminal run `corepack pnpm start`.
4. you can run the application from a docker image. use `docker-compose up --build`.

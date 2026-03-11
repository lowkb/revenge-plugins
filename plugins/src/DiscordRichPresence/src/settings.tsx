import { ErrorBoundary } from "@vendetta/ui/components";
import { Forms } from "@vendetta/ui/components";
import { ReactNative as RN } from "@vendetta/metro/common";

const { FormSection, FormInput, FormSwitchRow } = Forms;

export interface Activity {
  name: string;
  application_id: string;
  type: number;
  details: string;
  state: string;
  timestamps: {
    _enabled: boolean;
    start?: number;
  };
  assets: {
    large_image: string;
    large_text: string;
    small_image: string;
    small_text: string;
  };
  buttons: {
    label: string;
    url: string;
  }[];
}

export default function Settings({ activity }: { activity: Activity }) {
  return (
    <ErrorBoundary>
      <RN.ScrollView style={{ flex: 1 }}>

        <FormSection title="Basic">

          <FormInput
            title="Name"
            placeholder="Example"
            value={activity.name}
            onChange={(v: string) => activity.name = v}
          />

          <FormInput
            title="Application ID"
            placeholder="000000000000000000"
            value={activity.application_id}
            onChange={(v: string) => activity.application_id = v}
          />

          <FormInput
            title="Details"
            placeholder="Example details"
            value={activity.details}
            onChange={(v: string) => activity.details = v}
          />

          <FormInput
            title="State"
            placeholder="Example state"
            value={activity.state}
            onChange={(v: string) => activity.state = v}
          />

        </FormSection>


        <FormSection title="Assets">

          <FormInput
            title="Large Image"
            value={activity.assets.large_image}
            onChange={(v: string) => activity.assets.large_image = v}
          />

          <FormInput
            title="Large Text"
            value={activity.assets.large_text}
            onChange={(v: string) => activity.assets.large_text = v}
          />

          <FormInput
            title="Small Image"
            value={activity.assets.small_image}
            onChange={(v: string) => activity.assets.small_image = v}
          />

          <FormInput
            title="Small Text"
            value={activity.assets.small_text}
            onChange={(v: string) => activity.assets.small_text = v}
          />

        </FormSection>


        <FormSection title="Timestamps">

          <FormSwitchRow
            label="Enable timestamps"
            value={activity.timestamps._enabled}
            onValueChange={(v: boolean) => activity.timestamps._enabled = v}
          />

        </FormSection>


        <FormSection title="Buttons">

          {activity.buttons.map((b, i) => (
            <RN.View key={i}>

              <FormInput
                title={`Button ${i + 1} Label`}
                value={b.label}
                onChange={(v: string) => b.label = v}
              />

              <FormInput
                title={`Button ${i + 1} URL`}
                value={b.url}
                onChange={(v: string) => b.url = v}
              />

            </RN.View>
          ))}

        </FormSection>

      </RN.ScrollView>
    </ErrorBoundary>
  );
}    return (
        <ErrorBoundary>
            <RN.ScrollView style={{ flex: 1 }}>

                <FormSection title="Basic" titleStyleType="no_border">

                    <FormInput
                        title="Name"
                        placeholder="name"
                        value={activity.name}
                        leading={<FormIcon source={Icons.RPC} />}
                        onChange={v => activity.name = v}
                    />

                    <FormInput
                        title="Application ID"
                        placeholder=""
                        value={activity.application_id}
                        onChange={v => activity.application_id = v}
                    />

                    <FormInput
                        title="Details"
                        placeholder="detail"
                        value={activity.details}
                        onChange={v => activity.details = v}
                    />

                    <FormInput
                        title="State"
                        placeholder="state"
                        value={activity.state}
                        onChange={v => activity.state = v}
                    />

                </FormSection>


                <FormSection title="Assets" titleStyleType="no_border">

                    <FormInput
                        title="Large Image Key"
                        value={activity.assets.large_image}
                        onChange={v => activity.assets.large_image = v}
                    />

                    <FormInput
                        title="Large Text"
                        value={activity.assets.large_text}
                        onChange={v => activity.assets.large_text = v}
                    />

                    <FormInput
                        title="Small Image Key"
                        value={activity.assets.small_image}
                        onChange={v => activity.assets.small_image = v}
                    />

                    <FormInput
                        title="Small Text"
                        value={activity.assets.small_text}
                        onChange={v => activity.assets.small_text = v}
                    />

                </FormSection>


                <FormSection title="Timestamps" titleStyleType="no_border">

                    <FormSwitchRow
                        label="Enable timestamps"
                        value={activity.timestamps._enabled}
                        onValueChange={v => activity.timestamps._enabled = v}
                    />

                </FormSection>


                <FormSection title="Buttons" titleStyleType="no_border">

                    {activity.buttons.map((b, i) => (
                        <RN.View key={i}>

                            <FormInput
                                title={`Button ${i + 1} Label`}
                                placeholder="Label"
                                value={b.label}
                                onChange={v => b.label = v}
                            />

                            <FormInput
                                title={`Button ${i + 1} URL`}
                                placeholder="https://example.com"
                                value={b.url}
                                onChange={v => b.url = v}
                            />

                        </RN.View>
                    ))}

                </FormSection>

            </RN.ScrollView>
        </ErrorBoundary>
    );
}                    <FormInput
                        title="Application ID"
                        placeholder="Discord Application ID"
                        value={activity.application_id}
                        onChange={v => activity.application_id = v}
                    />

                    <FormInput
                        title="Details"
                        placeholder="Example details"
                        value={activity.details}
                        onChange={v => activity.details = v}
                    />

                    <FormInput
                        title="State"
                        placeholder="Example state"
                        value={activity.state}
                        onChange={v => activity.state = v}
                    />

                </FormSection>


                <FormSection title="Assets" titleStyleType="no_border">

                    <FormInput
                        title="Large Image Key"
                        value={activity.assets.large_image}
                        onChange={v => activity.assets.large_image = v}
                    />

                    <FormInput
                        title="Large Text"
                        value={activity.assets.large_text}
                        onChange={v => activity.assets.large_text = v}
                    />

                    <FormInput
                        title="Small Image Key"
                        value={activity.assets.small_image}
                        onChange={v => activity.assets.small_image = v}
                    />

                    <FormInput
                        title="Small Text"
                        value={activity.assets.small_text}
                        onChange={v => activity.assets.small_text = v}
                    />

                </FormSection>


                <FormSection title="Timestamps" titleStyleType="no_border">

                    <FormSwitchRow
                        label="Enable timestamps"
                        value={activity.timestamps._enabled}
                        onValueChange={v => activity.timestamps._enabled = v}
                    />

                </FormSection>


                <FormSection title="Buttons" titleStyleType="no_border">

                    {activity.buttons.map((b, i) => (
                        <React.Fragment key={i}>

                            <FormInput
                                title={`Button ${i + 1} Label`}
                                placeholder="Label"
                                value={b.label}
                                onChange={v => b.label = v}
                            />

                            <FormInput
                                title={`Button ${i + 1} URL`}
                                placeholder="https://example.com"
                                value={b.url}
                                onChange={v => b.url = v}
                            />

                        </React.Fragment>
                    ))}

                </FormSection>

            </ReactNative.ScrollView>
        </ErrorBoundary>
    );
};    return (
        <ErrorBoundary>
            <ReactNative.ScrollView style={{ flex: 1 }}>

                <FormSection title="Basic" titleStyleType="no_border">
                    <FormInput
                        title="Name"
                        placeholder="Reveg©"
                        value={activity.name}
                        leading={<FormIcon source={Icons.RPC} />}
                        onChange={v => activity.name = v}
                    />

                    <FormInput
                        title="Application ID"
                        placeholder="1054951789318909972"
                        value={activity.application_id}
                        onChange={v => activity.application_id = v}
                    />

                    <FormInput
                        title="Details"
                        placeholder="Competitive"
                        value={activity.details}
                        onChange={v => activity.details = v}
                    />

                    <FormInput
                        title="State"
                        placeholder="Playing Solo"
                        value={activity.state}
                        onChange={v => activity.state = v}
                    />
                </FormSection>


                <FormSection title="Assets" titleStyleType="no_border">

                    <FormInput
                        title="Large Image Key"
                        value={activity.assets.large_image}
                        onChange={v => activity.assets.large_image = v}
                    />

                    <FormInput
                        title="Large Text"
                        value={activity.assets.large_text}
                        onChange={v => activity.assets.large_text = v}
                    />

                    <FormInput
                        title="Small Image Key"
                        value={activity.assets.small_image}
                        onChange={v => activity.assets.small_image = v}
                    />

                    <FormInput
                        title="Small Text"
                        value={activity.assets.small_text}
                        onChange={v => activity.assets.small_text = v}
                    />

                </FormSection>


                <FormSection title="Timestamps" titleStyleType="no_border">

                    <FormSwitchRow
                        label="Enable timestamps"
                        value={activity.timestamps._enabled}
                        onValueChange={v => activity.timestamps._enabled = v}
                    />

                </FormSection>


                <FormSection title="Buttons" titleStyleType="no_border">

                    {activity.buttons.map((b, i) => (
                        <React.Fragment key={i}>

                            <FormInput
                                title={`Button ${i + 1} Label`}
                                placeholder="Label"
                                value={b.label}
                                onChange={v => b.label = v}
                            />

                            <FormInput
                                title={`Button ${i + 1} URL`}
                                placeholder="https://example.com"
                                value={b.url}
                                onChange={v => b.url = v}
                            />

                        </React.Fragment>
                    ))}

                </FormSection>

            </ReactNative.ScrollView>
        </ErrorBoundary>
    );
};

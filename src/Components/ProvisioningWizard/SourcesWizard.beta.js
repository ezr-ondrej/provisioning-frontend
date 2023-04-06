import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';

import { Form, FormGroup, TextInput, Wizard, Text, Title } from '@patternfly/react-core';

import { SOURCES_QUERY_KEY } from '../../API/queryKeys';
import { fetchSourcesList } from '../../API';

export const sourcesData = (provider) => {
  const {
    error,
    isLoading,
    refetch,
    data: sources,
  } = useQuery([SOURCES_QUERY_KEY, provider], () => fetchSourcesList(provider), {
    enabled: !!provider,
  });
  return { error, isLoading, refetch, sources };
};

const createNewSource = async ({ name, keyId, keySecret }) => {
  const params = {
    sources: [{ name, app_creation_workflow: 'account_authorization', source_type_name: 'amazon' }],
    authentications: [{ authtype: 'access_key_secret_key', username: keyId, password: keySecret, resource_name: name, resource_type: 'source' }],
    applications: [{ application_type_id: '11', source_name: name }],
  };
  return axios.post('/api/sources/v3.1/bulk_create', params);
};

const SourceSetupStep = ({ keyId, keySecret, setKeyId, setKeySecret }) => {
  return (
    <Form>
      <Title ouiaId="pubkey_title" headingLevel="h1">
        SSH keys authentication
      </Title>
      <Text ouiaId="pubkey_description">Establish secure, reliable communication and strong encryption to protect data.</Text>

      <FormGroup isRequired label="Access key ID">
        <TextInput ouiaId="new_source_access_key_id" validated={true} value={keyId} id="public-key-name" onChange={setKeyId} type="text" />
      </FormGroup>

      <FormGroup isRequired label="Secret access key">
        <TextInput ouiaId="new_source_secret" validated={true} value={keySecret} id="public-key-name" onChange={setKeySecret} type="text" />
      </FormGroup>
    </Form>
  );
};

const FinishStep = ({ name, keyId, keySecret, onSuccess }) => {
  const { mutate: createSource, error: sourceError } = useMutation(createNewSource, {
    onSuccess,
  });

  React.useEffect(() => {
    if (createSource) {
      createSource({ name, keyId, keySecret });
    }
  }, [createSource]);

  return (
    <>
      <Title ouiaId="review_details_title" headingLevel="h1">
        Creating Source
      </Title>
    </>
  );
};

const ReviewSource = () => {
  return (
    <>
      <Title ouiaId="review_details_title" headingLevel="h1">
        Review details
      </Title>
      <Text ouiaId="review_details_description">
        Review the information below and then click <b>Create</b> to finish the process.
      </Text>
    </>
  );
};

const SourcesWizard = ({ provider, onClose }) => {
  const { error, isLoading, refetch, sources } = sourcesData(provider);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');

  const steps = [
    {
      name: 'Source',
      id: 1,
      component: <SourceSetupStep keyId={keyId} keySecret={keySecret} setKeyId={setKeyId} setKeySecret={setKeySecret} />,
      canJumpTo: true,
    },
    {
      name: 'Review',
      id: 10,
      component: <ReviewSource />,
      nextButtonText: 'Create Source',
    },
    {
      name: 'Source cretion status',
      id: 20,
      component: <FinishStep name="source1" keyId={keyId} keySecret={keySecret} onSuccess={() => refetch()} />,
      isFinishedStep: true,
    },
  ];

  const onNext = ({ id, name }, { prevId, prevName }) => {
    console.log(`current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`);
    // setStepIdReached((prevID) => (prevID < id ? id : prevID));
  };

  return (
    <Wizard
      title="Setup sources"
      description={`Setup source`}
      steps={steps}
      isOpen
      onClose={onClose}
      onNext={onNext}
      className={'provisioning'}
    />
  );
};

export default SourcesWizard;

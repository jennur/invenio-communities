/*
 * This file is part of Invenio.
 * Copyright (C) 2016-2021 CERN.
 * Copyright (C) 2021 Northwestern University.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Formik } from "formik";
import _defaultsDeep from "lodash/defaultsDeep";
import _get from "lodash/get";

import {
  Divider,
  Icon,
  Grid,
  Button,
  Header,
  Form,
  Message,
} from "semantic-ui-react";
import { RadioField } from "react-invenio-forms";

import { CommunityApi } from "../api";
import { i18next } from "@translations/invenio_communities/i18next";
import { communityErrorSerializer } from "../api/serializers";

class CommunityPrivilegesForm extends Component {
  state = {
    error: "",
    isSaved: false,
  };
  getInitialValues = () => {
    let initialValues = _defaultsDeep(this.props.community, {
      access: {
        visibility: "public",
        // TODO: Re-enable once properly integrated to be displayed
        // member_policy: "open",
        // record_policy: "open",
      },
    });

    return initialValues;
  };

  setGlobalError = (errorMsg) => {
    this.setState({ error: errorMsg });
  };

  setIsSavedState = (newValue) => {
    this.setState({ isSaved: newValue });
  };

  onSubmit = async (values, { setSubmitting, setFieldError }) => {
    setSubmitting(true);

    try {
      const client = new CommunityApi();
      await client.update(this.props.community.id, values);

      this.setIsSavedState(true);
    } catch (error) {
      if (error === "UNMOUNTED") return;

      const { message, errors } = communityErrorSerializer(error);

      if (message) {
        this.setGlobalError(message);
      }

      if (errors) {
        errors.forEach(({ field, messages }) =>
          setFieldError(field, messages[0])
        );
      }
    }

    setSubmitting(false);
  };

  render() {
    const { isSaved, error } = this.state;
    return (
      <Formik
        initialValues={this.getInitialValues(this.props.community)}
        onSubmit={this.onSubmit}
      >
        {({ isSubmitting, handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <Message
              hidden={error === ""}
              negative
              className="flashed top attached"
            >
              <Grid container>
                <Grid.Column width={15} textAlign="left">
                  <strong>{error}</strong>
                </Grid.Column>
              </Grid>
            </Message>
            <Grid>
              <Grid.Column width={16}>
                <Header as="h2">{i18next.t("Community permissions")}</Header>
                <Divider />
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h3">{i18next.t("Community visibility")}</Header>
                {this.props.formConfig.access.visibilty.map((item) => (
                  <React.Fragment key={item.value}>
                    <RadioField
                      key={item.value}
                      fieldPath="access.visibility"
                      label={item.text}
                      labelIcon={item.icon}
                      checked={_get(values, "access.visibility") === item.value}
                      value={item.value}
                      onChange={({ event, data, formikProps }) => {
                        formikProps.form.setFieldValue(
                          "access.visibility",
                          item.value
                        );
                        this.setIsSavedState(false);
                      }}
                    />
                    <label className="helptext">{item.helpText}</label>
                  </React.Fragment>
                ))}
                <Button
                  compact
                  primary
                  icon
                  labelPosition="left"
                  loading={isSubmitting}
                  toggle
                  active={isSaved}
                  type="submit"
                >
                  <Icon name="save"></Icon>
                  {isSaved ? i18next.t("Saved") : i18next.t("Save")}
                </Button>
              </Grid.Column>
              <Grid.Column width={8} />
              {/* TODO: Re-enable once properly integrated to be displayed */}
              {/*
              <Grid.Column width={6}>
                <Header as="h3">Records permissions</Header>
                <p>This is a text explaining about the permission</p>
                <SelectField
                  fieldPath="access.record_policy"
                  options={this.props.formConfig.access.record_policy}
                />
                <Button compact primary icon labelPosition="left">
                  <Icon name="save"></Icon>Save
                </Button>
              </Grid.Column>
              <Grid.Column width={10} />
              <Grid.Column width={6}>
                <Header as="h3">Members permission policy</Header>
                <p>This is a text explaining about the permission</p>
                <SelectField
                  fieldPath="access.member_policy"
                  options={this.props.formConfig.access.member_policy}
                />
                <Button compact primary icon labelPosition="left">
                  <Icon name="save"></Icon>Save
                </Button>
              </Grid.Column>
              <Grid.Column width={10} /> */}
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

const domContainer = document.getElementById("app");
const formConfig = JSON.parse(domContainer.dataset.formConfig);
const community = JSON.parse(domContainer.dataset.community);

ReactDOM.render(
  <CommunityPrivilegesForm formConfig={formConfig} community={community} />,
  domContainer
);
export default CommunityPrivilegesForm;
